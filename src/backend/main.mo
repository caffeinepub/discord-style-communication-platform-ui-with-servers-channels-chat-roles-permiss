import Map "mo:core/Map";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Migration "migration";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type RegisterPayload = {
    username : Text;
    email : Text;
    password : Text;
  };

  public type Session = {
    token : Text;
    accountId : Text;
    expiresAt : Int;
    email : ?Text;
  };

  public type UserProfile = {
    name : Text;
    aboutMe : Text;
    customStatus : Text;
    avatarUrl : Text;
    bannerUrl : Text;
    badges : [Text];
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  let sessionStore = Map.empty<Text, Session>();

  public shared ({ caller }) func register(payload : RegisterPayload) : async ?Session {
    let currentRole = AccessControl.getUserRole(accessControlState, caller);
    switch (currentRole) {
      case (#user) {
        Runtime.trap("Unauthorized: Already registered as user");
      };
      case (#admin) {
        Runtime.trap("Unauthorized: Already registered as admin");
      };
      case (#guest) {
      };
    };

    let token = payload.username.concat("Token");
    let session : Session = {
      token;
      accountId = payload.username.concat("Account");
      expiresAt = Time.now() + 86_400_000_000_000;
      email = ?payload.email;
    };

    sessionStore.add(token, session);

    AccessControl.assignRole(accessControlState, caller, caller, #user);

    ?session;
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
