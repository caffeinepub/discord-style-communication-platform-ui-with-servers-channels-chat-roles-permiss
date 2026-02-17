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
    principal : Principal;
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
  let credentialsByUsername = Map.empty<Text, Credentials>();
  let credentialsByEmail = Map.empty<Text, Credentials>();
  let credentialsByPrincipal = Map.empty<Principal, Credentials>();

  /// Converts everything to lowercase and trims spaces.
  func sanitizeText(input : Text) : Text {
    let lower = input.toLower();
    let trimmedBegin = lower.trimStart(#char(' '));
    trimmedBegin.trimEnd(#char(' '));
  };

  public shared ({ caller }) func register(payload : RegisterPayload) : async ?RegistrationError {
    let sanitizedUsername = sanitizeText(payload.username);
    let sanitizedEmail = sanitizeText(payload.email);

    // Check if the caller principal has stored credentials (not just a role check)
    if (credentialsByPrincipal.containsKey(caller)) {
      // Caller principal is already registered
      return ?#alreadyRegistered;
    };

    // Check uniqueness by username
    if (credentialsByUsername.containsKey(sanitizedUsername)) {
      return ?#usernameTaken;
    };

    // Check uniqueness by email (case-insensitive)
    if (credentialsByEmail.containsKey(sanitizedEmail)) {
      return ?#emailTaken;
    };

    let accountId = payload.username.concat("Account");
    let credentials : Credentials = {
      username = sanitizedUsername;
      email = sanitizedEmail;
      password = payload.password;
      accountId;
      principal = caller;
    };

    // Store credentials by username and email separately
    credentialsByUsername.add(sanitizedUsername, credentials);
    credentialsByEmail.add(sanitizedEmail, credentials);

    // Store credentials indexed by principal
    credentialsByPrincipal.add(caller, credentials);

    // Assign user role to the newly registered principal
    AccessControl.assignRole(accessControlState, caller, caller, #user);

    // Create initial user profile
    let initialProfile : UserProfile = {
      name = sanitizedUsername;
      aboutMe = "";
      customStatus = "";
      avatarUrl = "";
      bannerUrl = "";
      badges = [];
    };
    userProfiles.add(caller, initialProfile);

    null; // Success - no error.
  };

  public shared ({ caller }) func login(payload : LoginPayload) : async ?Session {
    let sanitizedIdentifier = sanitizeText(payload.loginIdentifier);

    // Try to find credentials by username, then by email
    let credentialsOpt = switch (credentialsByUsername.get(sanitizedIdentifier)) {
      case (?creds) { ?creds };
      case (null) { credentialsByEmail.get(sanitizedIdentifier) };
    };

    switch (credentialsOpt) {
      case (null) { null };
      case (?credentials) {
        if (credentials.password != payload.password) {
          return null;
        };

        // Verify the caller matches the stored principal for these credentials
        if (caller != credentials.principal) {
          return null;
        };

        // Create new session token
        let token = caller.toText().concat("_").concat(Time.now().toText());
        let session : Session = {
          token;
          accountId = ?credentials.accountId;
          expiresAt = Time.now() + 86_400_000_000_000;
          email = credentials.email;
          principal = caller; // Store the owner of the session
        };

        sessionStore.add(token, session);
        ?session;
      };
    };
  };

  public query ({ caller }) func validateSession(token : Text) : async ?Session {
    switch (sessionStore.get(token)) {
      case (null) { null };
      case (?session) {
        if (caller != session.principal) {
          // Only the original session owner can validate this session
          return null;
        };
        if (Time.now() > session.expiresAt) { null } else { ?session };
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
