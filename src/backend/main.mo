import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Auth "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  var accessControlState : Auth.AccessControlState = Auth.initState();

  let userProfiles = Map.empty<Principal, UserProfile>();
  let usernames = Map.empty<Text, Principal>();
  let credentialsStore = Map.empty<Principal, Credentials>();

  let servers = Map.empty<Text, Server>();
  let serverMembers = Map.empty<Text, List.List<Principal>>();
  let categories = Map.empty<Text, Map.Map<Text, Category>>();
  let channels = Map.empty<Text, Map.Map<Text, Channel>>();
  let categoryOrder = Map.empty<Text, List.List<Text>>();
  let channelOrder = Map.empty<Text, Map.Map<Text, List.List<Text>>>();

  public type RegisterPayload = {
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

  public type Category = {
    id : Text;
    name : Text;
    serverId : Text;
  };

  public type Channel = {
    id : Text;
    name : Text;
    channelType : ChannelType;
    categoryId : Text;
    serverId : Text;
  };

  public type ChannelType = { #text; #voice };

  // Registration function - accessible to guests/anonymous users
  public shared ({ caller }) func register(payload : RegisterPayload) : async RegistrationResult {
    switch (credentialsStore.get(caller)) {
      case (?_) { return #error(#alreadyRegistered) };
      case null {};
    };

    switch (usernames.get(payload.username)) {
      case (?_) { return #error(#usernameTaken) };
      case null {};
    };

    let emailTaken = credentialsStore.values().any(
      func(cred : Credentials) : Bool {
        cred.email == payload.email
      }
    );
    if (emailTaken) {
      return #error(#emailTaken);
    };

    let credentials : Credentials = {
      username = payload.username;
      email = payload.email;
      password = payload.password;
      principal = caller;
    };
    credentialsStore.add(caller, credentials);
    usernames.add(payload.username, caller);

    let defaultProfile : UserProfile = {
      name = payload.username;
      aboutMe = "";
      customStatus = "";
      avatarUrl = "";
      bannerUrl = "";
      badges = [];
    };
    userProfiles.add(caller, defaultProfile);

    Auth.assignRole(accessControlState, caller, caller, #user);

    #success;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not Auth.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  func isCallerMemberOfServer(caller : Principal, serverId : Text) : Bool {
    switch (serverMembers.get(serverId)) {
      case (null) { false };
      case (?members) {
        members.any(func(member) { member == caller });
      };
    };
  };

  func requireServerMembership(caller : Principal, serverId : Text) {
    switch (serverMembers.get(serverId)) {
      case (null) {
        Runtime.trap("Unauthorized: You must be a member of this server");
      };
      case (?members) {
        if (not members.any(func(member) { member == caller })) {
          Runtime.trap("Unauthorized: You must be a member of this server");
        };
      };
    };
  };

  public shared ({ caller }) func createServer(payload : CreateServerPayload) : async Server {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create servers");
    };

    let uniqueId = generateUniqueId("server-");

    let newServer : Server = {
      id = uniqueId;
      name = payload.name;
      description = payload.description;
      isPublic = payload.isPublic;
      iconURL = payload.iconURL;
      bannerURL = payload.bannerURL;
    };

    servers.add(newServer.id, newServer);

    let membersList = List.empty<Principal>();
    membersList.add(caller);
    serverMembers.add(newServer.id, membersList);

    newServer;
  };

  public query ({ caller }) func getAllServers() : async [Server] {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view servers");
    };
    servers.toArray().map<(Text, Server), Server>(func((_, server)) { server });
  };

  public query ({ caller }) func getServer(id : Text) : async ?Server {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view servers");
    };
    servers.get(id);
  };

  public query ({ caller }) func getCategories(serverId : Text) : async [Category] {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view categories");
    };

    requireServerMembership(caller, serverId);

    switch (categories.get(serverId)) {
      case (null) { [] };
      case (?categoryMap) {
        categoryMap.values().toArray();
      };
    };
  };

  public shared ({ caller }) func createCategory(serverId : Text, name : Text) : async Category {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create categories");
    };

    requireServerMembership(caller, serverId);

    let uniqueId = generateUniqueId("category-");
    let newCategory : Category = {
      id = uniqueId;
      name;
      serverId;
    };

    let categoryMap = switch (categories.get(serverId)) {
      case (null) { Map.empty<Text, Category>() };
      case (?existingMap) { existingMap };
    };
    categoryMap.add(newCategory.id, newCategory);
    categories.add(serverId, categoryMap);

    let existingOrder = switch (categoryOrder.get(serverId)) {
      case (null) { List.empty<Text>() };
      case (?order) { order };
    };
    existingOrder.add(newCategory.id);
    categoryOrder.add(serverId, existingOrder);

    newCategory;
  };

  public shared ({ caller }) func renameCategory(
    serverId : Text,
    categoryId : Text,
    newName : Text,
  ) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can rename categories");
    };

    requireServerMembership(caller, serverId);

    switch (categories.get(serverId)) {
      case (null) { Runtime.trap("Category does not exist") };
      case (?categoryMap) {
        switch (categoryMap.get(categoryId)) {
          case (null) { Runtime.trap("Category not found") };
          case (?category) {
            let updatedCategory = { category with name = newName };
            categoryMap.add(categoryId, updatedCategory);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteCategory(serverId : Text, categoryId : Text) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete categories");
    };

    requireServerMembership(caller, serverId);

    switch (categories.get(serverId)) {
      case (null) { () };
      case (?categoryMap) {
        if (not categoryMap.containsKey(categoryId)) {
          Runtime.trap("Category not found");
        };
        categoryMap.remove(categoryId);
      };
    };

    switch (categoryOrder.get(serverId)) {
      case (null) { () };
      case (?order) {
        let filteredOrder = order.filter(func(id) { id != categoryId });
        categoryOrder.add(serverId, filteredOrder);
      };
    };
  };

  public shared ({ caller }) func addTextChannelToCategory(
    serverId : Text,
    categoryId : Text,
    name : Text,
  ) : async Channel {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create channels");
    };

    requireServerMembership(caller, serverId);

    addChannelToCategoryInternal(serverId, categoryId, name, #text);
  };

  public shared ({ caller }) func addVoiceChannelToCategory(
    serverId : Text,
    categoryId : Text,
    name : Text,
  ) : async Channel {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create channels");
    };

    requireServerMembership(caller, serverId);

    addChannelToCategoryInternal(serverId, categoryId, name, #voice);
  };

  func addChannelToCategoryInternal(
    serverId : Text,
    categoryId : Text,
    name : Text,
    channelType : ChannelType,
  ) : Channel {
    let uniqueId = generateUniqueId("channel-");

    let newChannel : Channel = {
      id = uniqueId;
      name;
      channelType;
      categoryId;
      serverId;
    };

    let channelMap = switch (channels.get(categoryId)) {
      case (null) { Map.empty<Text, Channel>() };
      case (?existingMap) { existingMap };
    };
    channelMap.add(newChannel.id, newChannel);
    channels.add(categoryId, channelMap);

    let categoryChannels = switch (channelOrder.get(serverId)) {
      case (null) { Map.empty<Text, List.List<Text>>() };
      case (?existingMap) { existingMap };
    };
    let existingOrder = switch (categoryChannels.get(categoryId)) {
      case (null) { List.empty<Text>() };
      case (?order) { order };
    };
    existingOrder.add(newChannel.id);
    categoryChannels.add(categoryId, existingOrder);
    channelOrder.add(serverId, categoryChannels);

    newChannel;
  };

  public shared ({ caller }) func setCategoryOrder(
    serverId : Text,
    newOrder : [Text],
  ) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set category order");
    };

    requireServerMembership(caller, serverId);

    let orderList = List.fromArray(newOrder);
    categoryOrder.add(serverId, orderList);
  };

  public shared ({ caller }) func setChannelOrder(
    serverId : Text,
    categoryId : Text,
    newOrder : [Text],
  ) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set channel order");
    };

    requireServerMembership(caller, serverId);

    let categoryChannels = switch (channelOrder.get(serverId)) {
      case (null) { Map.empty<Text, List.List<Text>>() };
      case (?existingMap) { existingMap };
    };
    let orderList = List.fromArray(newOrder);
    categoryChannels.add(categoryId, orderList);
    channelOrder.add(serverId, categoryChannels);
  };

  func generateUniqueId(prefix : Text) : Text {
    let randomNum = 1 + 9_999_999_9999;
    prefix # randomNum.toText();
  };

  include MixinAuthorization(accessControlState);
};

