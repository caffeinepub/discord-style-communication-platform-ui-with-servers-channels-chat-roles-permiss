import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Authentication Types & State
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

  let persistentSessions = Map.empty<Text, Text>();
  let userEmails = Map.empty<Principal, Text>();

  // User Profile Types (unchanged)
  public type UserProfile = {
    name : Text;
    aboutMe : Text;
    customStatus : Text;
    avatarUrl : Text;
    bannerUrl : Text;
    badges : [Text];
  };

  public type UserStatus = {
    #Online;
    #Idle;
    #DoNotDisturb;
    #Invisible;
  };

  // Friend System Types (unchanged)
  public type FriendRequest = {
    from : Principal;
    to : Principal;
    timestamp : Nat;
  };

  public type FriendshipStatus = {
    #None;
    #RequestSent;
    #RequestReceived;
    #Friends;
    #Blocked;
  };

  // Permission Types
  public type Permission = {
    name : Text;
    value : Bool;
  };

  public type Role = {
    id : Nat;
    name : Text;
    color : Text;
    permissions : [Permission];
    position : Nat;
  };

  module Role {
    public func compare(role1 : Role, role2 : Role) : Order.Order {
      Nat.compare(role1.position, role2.position);
    };
  };

  // Channel Types
  public type TextChannel = {
    id : Nat;
    name : Text;
  };

  public type VoiceChannel = {
    id : Nat;
    name : Text;
  };

  public type ChannelCategory = {
    id : Nat;
    name : Text;
    textChannels : [TextChannel];
    voiceChannels : [VoiceChannel];
    isExpanded : Bool;
  };

  module ChannelCategory {
    public func compare(cat1 : ChannelCategory, cat2 : ChannelCategory) : Order.Order {
      Nat.compare(cat1.id, cat2.id);
    };
  };

  // Server Types
  public type ServerMember = {
    userId : Principal;
    roles : [Nat];
    joinedAt : Nat;
  };

  public type Server = {
    id : Nat;
    name : Text;
    description : Text;
    bannerUrl : Text;
    iconUrl : Text;
    owner : Principal;
    channels : [ChannelCategory];
    roles : [Role];
    members : [ServerMember];
    communityMode : Bool;
  };

  module Server {
    public func compare(server1 : Server, server2 : Server) : Order.Order {
      Nat.compare(server1.id, server2.id);
    };
  };

  // Messages Types
  public type TextChannelMessage = {
    id : Nat;
    serverId : Nat;
    textChannelId : Nat;
    createdBy : Principal;
    createdAt : Nat;
    content : Text;
    isPersistent : Bool;
  };

  public type VoiceChannelPresence = {
    serverId : Nat;
    voiceChannelId : Nat;
    userId : Principal;
    joinedAt : Nat;
  };

  module VoiceChannelPresence {
    public func compare(p1 : VoiceChannelPresence, p2 : VoiceChannelPresence) : Order.Order {
      Nat.compare(p1.joinedAt, p2.joinedAt);
    };
  };

  public type CategoryLevelOrdering = {
    id : Nat;
    textChannels : [Nat];
    voiceChannels : [Nat];
  };

  public type ServerOrdering = {
    categoryOrder : [Nat];
    categories : [CategoryLevelOrdering];
  };

  // Audit Log Types
  public type AuditEventType = {
    #ServerCreated;
    #ServerRenamed;
    #SettingsUpdated;
    #CategoryAdded;
    #TextChannelAdded;
    #VoiceChannelAdded;
    #ChannelMoved;
    #RoleAdded;
    #RolePermissionsSet;
    #RoleAssignedToUser;
    #RoleRemovedFromUser;
    #MessageSent;
    #UserJoinedVoiceChannel;
    #UserLeftVoiceChannel;
    #ServerJoined;
    #ServerLeft;
  };

  public type AuditLogEntry = {
    id : Nat;
    timestamp : Int;
    eventType : AuditEventType;
    serverId : Nat;
    userId : Principal;
    details : Text;
  };

  public type ServerMemberWithUsername = {
    member : ServerMember;
    username : Text;
  };

  public type ServerMemberInfo = {
    member : ServerMember;
    username : Text;
  };

  public type GetMembersWithRolesResponse = {
    members : [ServerMemberInfo];
    roles : [Role];
  };

  public type AdminVerificationData = {
    serverCount : Nat;
    userProfileCount : Nat;
    sessionCount : Nat;
    auditLogCount : Nat;
  };

  // State
  var nextServerId = 1;
  var nextCategoryId = 1;
  var nextChannelId = 1;
  var nextRoleId = 1;
  var nextMessageId = 1;
  var nextAuditLogId = 1;

  let servers = Map.empty<Nat, Server>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userStatuses = Map.empty<Principal, UserStatus>();
  let friendRequests = Map.empty<Principal, [FriendRequest]>();
  let friendships = Map.empty<Principal, [Principal]>();
  let blockedUsers = Map.empty<Principal, [Principal]>();
  let serverOrdering = Map.empty<Principal, [Nat]>();
  let persistentTextChannelMessages = Map.empty<Nat, Map.Map<Nat, [TextChannelMessage]>>();
  let voiceChannelPresences = Map.empty<Nat, Map.Map<Nat, [VoiceChannelPresence]>>();
  let userUsernames = Map.empty<Principal, Text>();
  let auditLogs = Map.empty<Nat, [AuditLogEntry]>();
  let newCategoryChannelOrders = Map.empty<Nat, ServerOrdering>();

  // Helper Functions
  func isServerOwner(serverId : Nat, caller : Principal) : Bool {
    switch (servers.get(serverId)) {
      case (null) { false };
      case (?server) { Principal.equal(server.owner, caller) };
    };
  };

  func isServerMember(serverId : Nat, caller : Principal) : Bool {
    switch (servers.get(serverId)) {
      case (null) { false };
      case (?server) {
        server.members.find<ServerMember>(func(m) { Principal.equal(m.userId, caller) }) != null;
      };
    };
  };

  func hasServerAdminPermission(serverId : Nat, caller : Principal) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) { return true };
    if (isServerOwner(serverId, caller)) { return true };

    switch (servers.get(serverId)) {
      case (null) { false };
      case (?server) {
        let memberOpt = server.members.find(func(m) { Principal.equal(m.userId, caller) });
        switch (memberOpt) {
          case (null) { false };
          case (?member) {
            member.roles.find<Nat>(func(roleId) {
              let roleOpt = server.roles.find(func(r) { r.id == roleId });
              switch (roleOpt) {
                case (null) { false };
                case (?role) {
                  role.permissions.find<Permission>(func(p) {
                    p.name == "administrator" and p.value;
                  }) != null;
                };
              };
            }) != null;
          };
        };
      };
    };
  };

  func getHighestRole(colorRoles : [Role]) : ?Role {
    if (colorRoles.size() == 0) { return null };
    let sortedRoles = colorRoles.sort();
    ?sortedRoles[0];
  };

  func logAuditEvent(serverId : Nat, userId : Principal, eventType : AuditEventType, details : Text) {
    let logEntry : AuditLogEntry = {
      id = nextAuditLogId;
      timestamp = Time.now();
      eventType;
      serverId;
      userId;
      details;
    };
    nextAuditLogId += 1;

    let currentLogs = switch (auditLogs.get(serverId)) {
      case (null) { [] };
      case (?logs) { logs };
    };
    auditLogs.add(serverId, currentLogs.concat([logEntry]));
  };

  // Admin Data Wipe Endpoint
  public shared ({ caller }) func adminWipeReplicaData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform a full wipe");
    };

    // Clear all data maps
    servers.clear();
    userProfiles.clear();
    userStatuses.clear();
    friendRequests.clear();
    friendships.clear();
    blockedUsers.clear();
    serverOrdering.clear();
    persistentTextChannelMessages.clear();
    voiceChannelPresences.clear();
    userUsernames.clear();
    auditLogs.clear();
    newCategoryChannelOrders.clear();
    persistentSessions.clear();
    userEmails.clear();

    // Reset ID counters to initial values
    nextServerId := 1;
    nextCategoryId := 1;
    nextChannelId := 1;
    nextRoleId := 1;
    nextMessageId := 1;
    nextAuditLogId := 1;
  };

  public query ({ caller }) func adminCheckWipeResult() : async AdminVerificationData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can check wipe result");
    };

    {
      serverCount = servers.size();
      userProfileCount = userProfiles.size();
      sessionCount = persistentSessions.size();
      auditLogCount = auditLogs.size();
    };
  };

  public shared ({ caller }) func register(payload : RegisterPayload) : async Session {
    let userId = caller.toText();
    let token = userId;
    let session : Session = {
      token;
      accountId = userId;
      expiresAt = 0;
      email = ?payload.email;
    };

    persistentSessions.add(token, userId);
    userEmails.add(caller, payload.email);

    userUsernames.add(caller, payload.username);

    let initialProfile : UserProfile = {
      name = payload.username;
      aboutMe = "";
      customStatus = "";
      avatarUrl = "";
      bannerUrl = "";
      badges = [];
    };
    userProfiles.add(caller, initialProfile);

    session;
  };

  public query ({ caller }) func validateSession(token : Text) : async ?Session {
    switch (persistentSessions.get(token)) {
      case (?accountId) {
        ?{
          token;
          accountId;
          expiresAt = 0;
          email = null;
        };
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func setUsername(desiredUsername : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set username");
    };

    let currentUsername = userUsernames.get(caller);

    let isUsernameTaken = userUsernames.entries().any(
      func((principal, existingUsername)) {
        existingUsername == desiredUsername and not Principal.equal(principal, caller);
      }
    );

    if (isUsernameTaken) {
      Runtime.trap("Username is already taken");
    };

    userUsernames.add(caller, desiredUsername);
  };

  public query ({ caller }) func getCallerUsername() : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access username");
    };
    userUsernames.get(caller);
  };

  public query ({ caller }) func getUsernameForUser(user : Principal) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view usernames");
    };
    userUsernames.get(user);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func setUserStatus(status : UserStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set status");
    };
    userStatuses.add(caller, status);
  };

  public query ({ caller }) func getUserStatus(user : Principal) : async ?UserStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view user status");
    };
    userStatuses.get(user);
  };

  public shared ({ caller }) func sendFriendRequest(to : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send friend requests");
    };
    if (Principal.equal(caller, to)) {
      Runtime.trap("Cannot send friend request to yourself");
    };

    let request : FriendRequest = {
      from = caller;
      to = to;
      timestamp = 0;
    };

    let existingRequests = switch (friendRequests.get(to)) {
      case (null) { [] };
      case (?reqs) { reqs };
    };

    friendRequests.add(to, existingRequests.concat([request]));
  };

  public shared ({ caller }) func acceptFriendRequest(from : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept friend requests");
    };

    let existingRequests = switch (friendRequests.get(caller)) {
      case (null) { [] };
      case (?reqs) { reqs };
    };
    let filteredRequests = existingRequests.filter(func(r) { not Principal.equal(r.from, from) });
    friendRequests.add(caller, filteredRequests);

    let callerFriends = switch (friendships.get(caller)) {
      case (null) { [] };
      case (?friends) { friends };
    };
    friendships.add(caller, callerFriends.concat([from]));

    let fromFriends = switch (friendships.get(from)) {
      case (null) { [] };
      case (?friends) { friends };
    };
    friendships.add(from, fromFriends.concat([caller]));
  };

  public shared ({ caller }) func declineFriendRequest(from : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can decline friend requests");
    };

    let existingRequests = switch (friendRequests.get(caller)) {
      case (null) { [] };
      case (?reqs) { reqs };
    };
    let filteredRequests = existingRequests.filter(func(r) { not Principal.equal(r.from, from) });
    friendRequests.add(caller, filteredRequests);
  };

  public shared ({ caller }) func removeFriend(friend : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove friends");
    };

    let callerFriends = switch (friendships.get(caller)) {
      case (null) { [] };
      case (?friends) { friends };
    };
    friendships.add(caller, callerFriends.filter<Principal>(func(p) { not Principal.equal(p, friend) }));

    let friendFriends = switch (friendships.get(friend)) {
      case (null) { [] };
      case (?friends) { friends };
    };
    friendships.add(friend, friendFriends.filter<Principal>(func(p) { not Principal.equal(p, caller) }));
  };

  public shared ({ caller }) func blockUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can block users");
    };

    let blocked = switch (blockedUsers.get(caller)) {
      case (null) { [] };
      case (?users) { users };
    };
    blockedUsers.add(caller, blocked.concat([user]));
  };

  public query ({ caller }) func getFriendRequests() : async [FriendRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view friend requests");
    };
    switch (friendRequests.get(caller)) {
      case (null) { [] };
      case (?reqs) { reqs };
    };
  };

  public query ({ caller }) func getFriends() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view friends");
    };
    switch (friendships.get(caller)) {
      case (null) { [] };
      case (?friends) { friends };
    };
  };
};
