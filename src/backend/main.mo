import Map "mo:core/Map";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Runtime "mo:core/Runtime";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type RegisterPayload = {
    username : Text;
    email : Text;
    password : Text;
  };

  type LoginPayload = {
    loginIdentifier : Text; // email or username
    password : Text;
  };

  type Session = {
    token : Text;
    accountId : ?Text;
    expiresAt : Int;
    email : Text;
  };

  public type UserProfile = {
    name : Text;
    aboutMe : Text;
    customStatus : Text;
    avatarUrl : Text;
    bannerUrl : Text;
    badges : [Text];
  };

  type Credentials = {
    username : Text;
    email : Text;
    password : Text;
    accountId : Text;
    principal : Principal;
  };

  public type RegistrationError = {
    #alreadyRegistered;
    #usernameTaken;
    #emailTaken;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let sessionStore = Map.empty<Text, Session>();
  let principalToToken = Map.empty<Principal, Text>();
  let credentialsByUsername = Map.empty<Text, Credentials>();
  let credentialsByEmail = Map.empty<Text, Credentials>();
  let credentialsByPrincipal = Map.empty<Principal, Credentials>();

  public shared ({ caller }) func register(payload : RegisterPayload) : async ?RegistrationError {
    // Check if the caller principal has stored credentials (not just a role check)
    if (credentialsByPrincipal.containsKey(caller)) {
      // Caller principal is already registered
      return ?#alreadyRegistered;
    };

    // Check uniqueness by username
    if (credentialsByUsername.containsKey(payload.username)) {
      return ?#usernameTaken;
    };

    // Check uniqueness by email
    if (credentialsByEmail.containsKey(payload.email)) {
      return ?#emailTaken;
    };

    let accountId = payload.username.concat("Account");
    let credentials : Credentials = {
      username = payload.username;
      email = payload.email;
      password = payload.password;
      accountId;
      principal = caller;
    };

    // Store credentials by username and email separately
    credentialsByUsername.add(payload.username, credentials);
    credentialsByEmail.add(payload.email, credentials);

    // Store credentials indexed by principal
    credentialsByPrincipal.add(caller, credentials);

    // Assign user role to the newly registered principal
    AccessControl.assignRole(accessControlState, caller, caller, #user);

    // Create session token
    let token = caller.toText().concat("_").concat(Time.now().toText());
    let session : Session = {
      token;
      accountId = ?accountId;
      expiresAt = Time.now() + 86_400_000_000_000;
      email = payload.email;
    };

    sessionStore.add(token, session);
    principalToToken.add(caller, token);

    // Create initial user profile
    let initialProfile : UserProfile = {
      name = payload.username;
      aboutMe = "";
      customStatus = "";
      avatarUrl = "";
      bannerUrl = "";
      badges = [];
    };
    userProfiles.add(caller, initialProfile);

    null // Success - no error
  };

  public shared ({ caller }) func login(payload : LoginPayload) : async ?Session {
    // Try to find credentials by username, then by email
    let credentialsOpt = switch (credentialsByUsername.get(payload.loginIdentifier)) {
      case (?creds) { ?creds };
      case (null) { credentialsByEmail.get(payload.loginIdentifier) };
    };

    switch (credentialsOpt) {
      case (null) { null };
      case (?credentials) {
        if (credentials.password != payload.password) {
          return null;
        };

        // Verify the caller matches the registered principal
        if (caller != credentials.principal) {
          return null;
        };

        // Ensure the user has the correct role (in case it was lost)
        if (AccessControl.getUserRole(accessControlState, caller) == #guest) {
          AccessControl.assignRole(accessControlState, caller, caller, #user);
        };

        // Create new session token
        let token = caller.toText().concat("_").concat(Time.now().toText());
        let session : Session = {
          token;
          accountId = ?credentials.accountId;
          expiresAt = Time.now() + 86_400_000_000_000;
          email = credentials.email;
        };

        sessionStore.add(token, session);
        principalToToken.add(caller, token);
        ?session;
      };
    };
  };

  public query ({ caller }) func validateSession(token : Text) : async ?Session {
    // Verify that the caller owns this token
    switch (principalToToken.get(caller)) {
      case (null) { null };
      case (?callerToken) {
        if (callerToken != token) {
          // Caller doesn't own this token
          return null;
        };

        switch (sessionStore.get(token)) {
          case (null) { null };
          case (?session) {
            if (Time.now() > session.expiresAt) { null } else { ?session };
          };
        };
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
