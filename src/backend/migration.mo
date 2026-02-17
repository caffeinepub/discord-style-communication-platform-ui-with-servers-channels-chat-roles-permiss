import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  type Credentials = {
    username : Text;
    email : Text;
    password : Text;
    principal : Principal;
  };

  type UserProfile = {
    name : Text;
    aboutMe : Text;
    customStatus : Text;
    avatarUrl : Text;
    bannerUrl : Text;
    badges : [Text];
  };

  type OldActor = {
    userProfiles : Map.Map<Text, UserProfile>;
    usernames : Map.Map<Text, Principal>;
    credentialsStore : Map.Map<Principal, Credentials>;
  };

  // New server types
  type Server = {
    id : Text;
    name : Text;
    description : Text;
    isPublic : Bool;
    iconURL : Text;
    bannerURL : Text;
  };

  type NewActor = {
    userProfiles : Map.Map<Text, UserProfile>;
    usernames : Map.Map<Text, Principal>;
    credentialsStore : Map.Map<Principal, Credentials>;
    servers : Map.Map<Text, Server>;
    serverMembers : Map.Map<Text, List.List<Principal>>;
  };

  public func run(old : OldActor) : NewActor {
    let emptyServers = Map.empty<Text, Server>();
    let emptyServerMembers = Map.empty<Text, List.List<Principal>>();
    {
      old with
      servers = emptyServers;
      serverMembers = emptyServerMembers;
    };
  };
};
