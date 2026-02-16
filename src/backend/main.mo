import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Types
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

  // Friend System Types
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
    // Sort by joinedAt
    public func compare(p1 : VoiceChannelPresence, p2 : VoiceChannelPresence) : Order.Order {
      Nat.compare(p1.joinedAt, p2.joinedAt);
    };
  };

  // State
  var nextServerId = 1;
  var nextCategoryId = 1;
  var nextChannelId = 1;
  var nextRoleId = 1;
  var nextMessageId = 1;

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

  // Health Check Method
  public query ({ caller }) func healthCheck() : async Bool {
    true;
  };

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

  // User Profile & Username Functions
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

  // User Profile Functions (Required by instructions)
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

  // User Status Functions
  public shared ({ caller }) func setUserStatus(status : UserStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set status");
    };
    userStatuses.add(caller, status);
  };

  public query ({ caller }) func getUserStatus(user : Principal) : async ?UserStatus {
    userStatuses.get(user);
  };

  // Friend System Functions
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

  // Server Management Functions
  public shared ({ caller }) func createServer(_name : Text, description : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create servers");
    };

    let serverId = nextServerId;
    nextServerId += 1;

    let ownerMember : ServerMember = {
      userId = caller;
      roles = [];
      joinedAt = 0;
    };

    let newServer : Server = {
      id = serverId;
      name = _name;
      description;
      bannerUrl = "";
      iconUrl = "";
      owner = caller;
      channels = [];
      roles = [];
      members = [ownerMember];
      communityMode = false;
    };

    servers.add(serverId, newServer);
    serverId;
  };

  public shared ({ caller }) func renameServer(serverId : Nat, newName : Text) : async () {
    if (not hasServerAdminPermission(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server admins can rename servers");
    };

    let server = switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?s) { s };
    };
    let updatedServer = { server with name = newName };
    servers.add(serverId, updatedServer);
  };

  public shared ({ caller }) func updateServerSettings(serverId : Nat, description : Text, bannerUrl : Text, iconUrl : Text, communityMode : Bool) : async () {
    if (not hasServerAdminPermission(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server admins can update server settings");
    };

    let server = switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?s) { s };
    };
    let updatedServer = {
      server with
      description = description;
      bannerUrl = bannerUrl;
      iconUrl = iconUrl;
      communityMode = communityMode;
    };
    servers.add(serverId, updatedServer);
  };

  public shared ({ caller }) func joinServer(serverId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join servers");
    };

    let server = switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?s) { s };
    };

    if (isServerMember(serverId, caller)) {
      Runtime.trap("Already a member of this server");
    };

    let newMember : ServerMember = {
      userId = caller;
      roles = [];
      joinedAt = 0;
    };

    let updatedServer = {
      server with
      members = server.members.concat([newMember]);
    };
    servers.add(serverId, updatedServer);
  };

  public shared ({ caller }) func leaveServer(serverId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can leave servers");
    };

    let server = switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?s) { s };
    };

    if (Principal.equal(server.owner, caller)) {
      Runtime.trap("Server owner cannot leave the server");
    };

    let updatedMembers = server.members.filter(func(m) { not Principal.equal(m.userId, caller) });
    let updatedServer = { server with members = updatedMembers };
    servers.add(serverId, updatedServer);
  };

  public shared ({ caller }) func setServerOrdering(ordering : [Nat]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set server ordering");
    };
    serverOrdering.add(caller, ordering);
  };

  public query ({ caller }) func getServerOrdering() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view server ordering");
    };
    switch (serverOrdering.get(caller)) {
      case (null) { [] };
      case (?ordering) { ordering };
    };
  };

  // Channel Management Functions
  public shared ({ caller }) func addCategoryToServer(serverId : Nat, categoryName : Text) : async Nat {
    if (not hasServerAdminPermission(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server admins can add categories");
    };

    let server = switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?s) { s };
    };
    let categoryId = nextCategoryId;
    nextCategoryId += 1;

    let newCategory : ChannelCategory = {
      id = categoryId;
      name = categoryName;
      textChannels = [];
      voiceChannels = [];
      isExpanded = true;
    };

    let updatedCategories = server.channels.concat([newCategory]);
    let updatedServer = { server with channels = updatedCategories };
    servers.add(serverId, updatedServer);
    categoryId;
  };

  public shared ({ caller }) func addTextChannel(serverId : Nat, categoryId : Nat, channelName : Text) : async Nat {
    if (not hasServerAdminPermission(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server admins can add channels");
    };

    let channelId = nextChannelId;
    nextChannelId += 1;

    let server = switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?s) { s };
    };

    let newChannel : TextChannel = {
      id = channelId;
      name = channelName;
    };

    let updatedCategories = server.channels.map(
      func(cat) {
        if (cat.id == categoryId) {
          { cat with textChannels = cat.textChannels.concat([newChannel]) };
        } else {
          cat;
        };
      },
    );

    let updatedServer = { server with channels = updatedCategories };
    servers.add(serverId, updatedServer);
    channelId;
  };

  public shared ({ caller }) func addVoiceChannel(serverId : Nat, categoryId : Nat, channelName : Text) : async Nat {
    if (not hasServerAdminPermission(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server admins can add channels");
    };

    let channelId = nextChannelId;
    nextChannelId += 1;

    let server = switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?s) { s };
    };

    let newChannel : VoiceChannel = {
      id = channelId;
      name = channelName;
    };

    let updatedCategories = server.channels.map(
      func(cat) {
        if (cat.id == categoryId) {
          { cat with voiceChannels = cat.voiceChannels.concat([newChannel]) };
        } else {
          cat;
        };
      },
    );

    let updatedServer = { server with channels = updatedCategories };
    servers.add(serverId, updatedServer);
    channelId;
  };

  // Role Management Functions
  public shared ({ caller }) func addRole(serverId : Nat, _name : Text, color : Text, permissions : [Permission]) : async Nat {
    if (not hasServerAdminPermission(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server admins can add roles");
    };

    let server = switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?s) { s };
    };

    let roleId = nextRoleId;
    nextRoleId += 1;

    let newRole : Role = {
      id = roleId;
      name = _name;
      color = color;
      permissions = permissions;
      position = server.roles.size();
    };

    let updatedServer = { server with roles = server.roles.concat([newRole]) };
    servers.add(serverId, updatedServer);
    roleId;
  };

  public shared ({ caller }) func setRolePermissions(serverId : Nat, _roleId : Nat, _permissions : [Permission]) : async () {
    if (not hasServerAdminPermission(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server admins can set role permissions");
    };

    let server = switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?s) { s };
    };

    let updatedRoles = server.roles.map(
      func(role) {
        if (role.id == _roleId) {
          { role with permissions = _permissions };
        } else {
          role;
        };
      },
    );

    let updatedServer = { server with roles = updatedRoles };
    servers.add(serverId, updatedServer);
  };

  public shared ({ caller }) func assignRoleToUser(serverId : Nat, _roleId : Nat, _user : Principal) : async () {
    if (not hasServerAdminPermission(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server admins can assign roles");
    };

    let server = switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?s) { s };
    };

    let updatedMembers = server.members.map(
      func(member) {
        if (Principal.equal(member.userId, _user)) {
          { member with roles = member.roles.concat([_roleId]) };
        } else {
          member;
        };
      },
    );

    let updatedServer = { server with members = updatedMembers };
    servers.add(serverId, updatedServer);
  };

  public shared ({ caller }) func removeRoleFromUser(serverId : Nat, _roleId : Nat, _user : Principal) : async () {
    if (not hasServerAdminPermission(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server admins can remove roles");
    };

    let server = switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?s) { s };
    };

    let updatedMembers = server.members.map(
      func(member) {
        if (Principal.equal(member.userId, _user)) {
          { member with roles = member.roles.filter(func(r) { r != _roleId }) };
        } else {
          member;
        };
      },
    );

    let updatedServer = { server with members = updatedMembers };
    servers.add(serverId, updatedServer);
  };

  // Query Functions
  public query ({ caller }) func getServer(serverId : Nat) : async Server {
    if (not isServerMember(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server members can view server details");
    };
    switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?server) { server };
    };
  };

  public query ({ caller }) func getAllServers() : async [Server] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view servers");
    };

    let allServers = servers.values().toArray();
    allServers.filter<Server>(func(server) {
      isServerMember(server.id, caller);
    });
  };

  public query func discoverServers() : async [Server] {
    servers.values().toArray();
  };

  public query ({ caller }) func getCategories(serverId : Nat) : async [ChannelCategory] {
    if (not isServerMember(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server members can view categories");
    };
    switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?server) {
        server.channels.sort<ChannelCategory>();
      };
    };
  };

  public query ({ caller }) func getRoles(serverId : Nat) : async [Role] {
    if (not isServerMember(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server members can view roles");
    };
    switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?server) {
        server.roles.sort<Role>();
      };
    };
  };

  public query ({ caller }) func getServerMembers(serverId : Nat) : async [ServerMember] {
    if (not isServerMember(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server members can view member list");
    };
    switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?server) { server.members };
    };
  };

  // Text Channel Messaging
  public shared ({ caller }) func sendTextChannelMessage(serverId : Nat, textChannelId : Nat, content : Text) : async Nat {
    if (not isServerMember(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server members can send messages");
    };

    let messageId = nextMessageId;
    nextMessageId += 1;

    let message : TextChannelMessage = {
      id = messageId;
      serverId;
      textChannelId;
      createdBy = caller;
      createdAt = Int.abs(Time.now());
      content;
      isPersistent = true;
    };

    let serverMessages = switch (persistentTextChannelMessages.get(serverId)) {
      case (null) {
        let newChannelMap = Map.empty<Nat, [TextChannelMessage]>();
        persistentTextChannelMessages.add(serverId, newChannelMap);
        newChannelMap;
      };
      case (?map) { map };
    };

    let existingMessages = switch (serverMessages.get(textChannelId)) {
      case (null) { [] };
      case (?msgs) { msgs };
    };
    serverMessages.add(textChannelId, existingMessages.concat([message]));

    messageId;
  };

  public shared ({ caller }) func getTextChannelMessages(serverId : Nat, textChannelId : Nat, startFromMessageId : ?Nat) : async [TextChannelMessage] {
    if (not isServerMember(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server members can view messages");
    };

    let serverMessages = switch (persistentTextChannelMessages.get(serverId)) {
      case (null) {
        let newChannelMap = Map.empty<Nat, [TextChannelMessage]>();
        persistentTextChannelMessages.add(serverId, newChannelMap);
        newChannelMap;
      };
      case (?map) { map };
    };

    let allMessages = switch (serverMessages.get(textChannelId)) {
      case (null) { [] };
      case (?msgs) { msgs };
    };

    let filteredMessages = switch (startFromMessageId) {
      case (null) { allMessages };
      case (?startId) {
        allMessages.filter(func(msg) { msg.id >= startId });
      };
    };
    filteredMessages.reverse();
  };

  // Voice Channel Presence
  public shared ({ caller }) func joinVoiceChannel(serverId : Nat, voiceChannelId : Nat) : async () {
    if (not isServerMember(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server members can join voice channels");
    };

    var channelMap = switch (voiceChannelPresences.get(serverId)) {
      case (null) {
        let newChannelMap = Map.empty<Nat, [VoiceChannelPresence]>();
        voiceChannelPresences.add(serverId, newChannelMap);
        newChannelMap;
      };
      case (?map) { map };
    };

    let existingUsers = switch (channelMap.get(voiceChannelId)) {
      case (null) { [] };
      case (?users) { users };
    };

    if (existingUsers.find(func(presence) { Principal.equal(presence.userId, caller) }) != null) {
      Runtime.trap("Already in this voice channel");
    };

    let presence : VoiceChannelPresence = {
      serverId;
      voiceChannelId;
      userId = caller;
      joinedAt = Int.abs(Time.now());
    };

    channelMap.add(voiceChannelId, existingUsers.concat([presence]));
  };

  public shared ({ caller }) func leaveVoiceChannel(serverId : Nat, voiceChannelId : Nat) : async () {
    if (not isServerMember(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server members can leave voice channels");
    };

    var channelMap = switch (voiceChannelPresences.get(serverId)) {
      case (null) {
        let newChannelMap = Map.empty<Nat, [VoiceChannelPresence]>();
        voiceChannelPresences.add(serverId, newChannelMap);
        newChannelMap;
      };
      case (?map) { map };
    };

    let existingUsers = switch (channelMap.get(voiceChannelId)) {
      case (null) { [] };
      case (?users) { users };
    };

    let filteredUsers = existingUsers.filter(
      func(presence) { not Principal.equal(presence.userId, caller) }
    );
    channelMap.add(voiceChannelId, filteredUsers);
  };

  public query ({ caller }) func getVoiceChannelParticipants(serverId : Nat, voiceChannelId : Nat) : async [VoiceChannelPresence] {
    if (not isServerMember(serverId, caller)) {
      Runtime.trap("Unauthorized: Only server members can view participants");
    };

    let channelMap = switch (voiceChannelPresences.get(serverId)) {
      case (null) {
        let newChannelMap = Map.empty<Nat, [VoiceChannelPresence]>();
        voiceChannelPresences.add(serverId, newChannelMap);
        newChannelMap;
      };
      case (?map) { map };
    };

    let users = switch (channelMap.get(voiceChannelId)) {
      case (null) { [] };
      case (?users) { users };
    };
    users.sort<VoiceChannelPresence>();
  };
};
