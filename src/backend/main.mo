import Map "mo:core/Map";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type RegisterPayload = {
    username : Text;
    email : Text;
    password : Text;
  };

  public type LoginPayload = {
    loginIdentifier : Text; // email or username
    password : Text;
  };

  public type Session = {
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

  public type Credentials = {
    username : Text;
    email : Text;
    password : Text;
    accountId : Text;
    principal : Principal;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let sessionStore = Map.empty<Text, Session>();
  let credentialsStore = Map.empty<Text, Credentials>();
  let principalToToken = Map.empty<Principal, Text>();

  public shared ({ caller }) func register(payload : RegisterPayload) : async ?Session {
    // Only guests (unauthenticated users) can register
    let currentRole = AccessControl.getUserRole(accessControlState, caller);
    if (currentRole != #guest) {
      Runtime.trap("Unauthorized: Already registered users cannot register again");
    };

    // Check if username or email already exists
    switch (credentialsStore.get(payload.username)) {
      case (?_) { return null };
      case null {};
    };
    switch (credentialsStore.get(payload.email)) {
      case (?_) { return null };
      case null {};
    };

    let accountId = payload.username.concat("Account");
    let credentials : Credentials = {
      username = payload.username;
      email = payload.email;
      password = payload.password;
      accountId;
      principal = caller;
    };

    // Store credentials by both username and email for lookup
    credentialsStore.add(payload.username, credentials);
    credentialsStore.add(payload.email, credentials);

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

    ignore AccessControl.getUserRole(accessControlState, caller);

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

    ?session;
  };

  public shared ({ caller }) func login(payload : LoginPayload) : async ?Session {
    switch (credentialsStore.get(payload.loginIdentifier)) {
      case (null) { return null };
      case (?credentials) {
        if (credentials.password != payload.password) {
          return null;
        };

        // Verify the caller matches the registered principal
        if (caller != credentials.principal) {
          Runtime.trap("Unauthorized: Principal mismatch");
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
    switch (sessionStore.get(token)) {
      case (null) { null };
      case (?session) {
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
