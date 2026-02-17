import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Auth "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Persistent State
  var accessControlState : Auth.AccessControlState = Auth.initState();

  let userProfiles = Map.empty<Text, UserProfile>();
  let usernames = Map.empty<Text, Principal>();
  let credentialsStore = Map.empty<Principal, Credentials>();

  // --- Persistent Servers State ---
  let servers = Map.empty<Text, Server>();
  let serverMembers = Map.empty<Text, List.List<Principal>>();

  // Types
  public type RegisterPayload = {
    username : Text;
    email : Text;
    password : Text;
  };

  public type UpdateCredentialsPayload = {
    username : Text;
    email : Text;
    password : Text;
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
    principal : Principal;
  };

  public type RegistrationResult = {
    #success;
    #error : RegistrationError;
  };

  public type RegistrationError = {
    #alreadyRegistered;
    #usernameTaken;
    #emailTaken;
    #roleAssignmentFailed;
    #unknown;
  };

  public type Server = {
    id : Text;
    name : Text;
    description : Text;
    isPublic : Bool;
    iconURL : Text;
    bannerURL : Text;
  };

  public type CreateServerPayload = {
    name : Text;
    description : Text;
    isPublic : Bool;
    iconURL : Text;
    bannerURL : Text;
  };

  public shared ({ caller }) func createServer(payload : CreateServerPayload) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create servers");
    };

    let newServer : Server = {
      id = payload.name;
      name = payload.name;
      description = payload.description;
      isPublic = payload.isPublic;
      iconURL = payload.iconURL;
      bannerURL = payload.bannerURL;
    };

    servers.add(newServer.id, newServer);

    // Add creator as first member
    let membersList = List.empty<Principal>();
    membersList.add(caller);
    serverMembers.add(newServer.id, membersList);
  };

  public query ({ caller }) func getAllServers() : async [Server] {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view servers");
    };
    servers.toArray().map<(Text, Server), Server>(func((_, server)) { server });
  };

  public query ({ caller }) func getServerById(id : Text) : async ?Server {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view servers");
    };
    servers.get(id);
  };

  public query ({ caller }) func isMemberOfServer(serverId : Text) : async Bool {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check membership");
    };
    switch (serverMembers.get(serverId)) {
      case (null) { false };
      case (?members) {
        members.any(func(member) { member == caller });
      };
    };
  };

  // SANITIZE FUNCTION NOT USED
  func sanitizeText(input : Text) : Text {
    let trimmed = input.trimStart(#char(' '));
    let trimmedEnd = trimmed.trimEnd(#char(' '));
    trimmedEnd.toLower();
  };

  // Find profile by username
  public query ({ caller }) func getUserProfile(username : Text) : async ?UserProfile {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(username);
  };

  public shared ({ caller }) func register(payload : RegisterPayload) : async RegistrationResult {
    if (credentialsStore.containsKey(caller)) {
      return #error(#alreadyRegistered);
    };

    let usernameExists = usernames.containsKey(payload.username);
    if (usernameExists) {
      return #error(#usernameTaken);
    };

    let emailExists = credentialsStore.values().any(
      func(credentials) { credentials.email == payload.email }
    );
    if (emailExists) {
      return #error(#emailTaken);
    };

    let credentials : Credentials = {
      username = payload.username;
      email = payload.email;
      password = payload.password;
      principal = caller;
    };

    let initialProfile : UserProfile = {
      name = payload.username;
      aboutMe = "";
      customStatus = "";
      avatarUrl = "";
      bannerUrl = "";
      badges = [];
    };

    credentialsStore.add(caller, credentials);
    userProfiles.add(payload.username, initialProfile);
    usernames.add(payload.username, caller);

    // Assign user role to the newly registered user
    // Note: The first user to call initialize() becomes admin
    // All subsequent registrations get #user role
    Auth.assignRole(accessControlState, caller, caller, #user);

    #success;
  };

  public query ({ caller }) func getUsernameForUser(user : Principal) : async ?Text {
    if (caller != user and not Auth.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own username");
    };
    switch (credentialsStore.get(user)) {
      case (null) { null };
      case (?credentials) { ?credentials.username };
    };
  };

  public query ({ caller }) func getCallerUsername() : async ?Text {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their account settings");
    };
    switch (credentialsStore.get(caller)) {
      case (null) { null };
      case (?credentials) { ?credentials.username };
    };
  };

  include MixinAuthorization(accessControlState);
};
