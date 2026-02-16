import Map "mo:core/Map";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    persistentSessions : Map.Map<Text, Text>;
    userEmails : Map.Map<Principal, Text>;
    nextServerId : Nat;
    nextCategoryId : Nat;
    nextChannelId : Nat;
    nextRoleId : Nat;
    nextMessageId : Nat;
    nextAuditLogId : Nat;
    servers : Map.Map<Nat, {
      id : Nat;
      name : Text;
      description : Text;
      bannerUrl : Text;
      iconUrl : Text;
      owner : Principal;
      channels : [(
        {
          id : Nat;
          name : Text;
          textChannels : [
            {
              id : Nat;
              name : Text;
            }
          ];
          voiceChannels : [
            {
              id : Nat;
              name : Text;
            }
          ];
          isExpanded : Bool;
        }
      )];
      roles : [
        {
          id : Nat;
          name : Text;
          color : Text;
          permissions : [
            {
              name : Text;
              value : Bool;
            }
          ];
          position : Nat;
        }
      ];
      members : [
        {
          userId : Principal;
          roles : [Nat];
          joinedAt : Nat;
        }
      ];
      communityMode : Bool;
    }>;
    auditLogs : Map.Map<Nat, [(
      {
        id : Nat;
        timestamp : Int;
        eventType : {
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
        serverId : Nat;
        userId : Principal;
        details : Text;
      }
    )]>;
    userProfiles : Map.Map<Principal, {
      name : Text;
      aboutMe : Text;
      customStatus : Text;
      avatarUrl : Text;
      bannerUrl : Text;
      badges : [Text];
    }>;
    userStatuses : Map.Map<Principal, {
      #Online;
      #Idle;
      #DoNotDisturb;
      #Invisible;
    }>;
    friendRequests : Map.Map<Principal, [
      {
        from : Principal;
        to : Principal;
        timestamp : Nat;
      }
    ]>;
    friendships : Map.Map<Principal, [Principal]>;
    blockedUsers : Map.Map<Principal, [Principal]>;
    serverOrdering : Map.Map<Principal, [Nat]>;
    persistentTextChannelMessages : Map.Map<Nat, Map.Map<Nat, [{
      id : Nat;
      serverId : Nat;
      textChannelId : Nat;
      createdBy : Principal;
      createdAt : Nat;
      content : Text;
      isPersistent : Bool;
    }]>>;
    voiceChannelPresences : Map.Map<Nat, Map.Map<Nat, [{
      serverId : Nat;
      voiceChannelId : Nat;
      userId : Principal;
      joinedAt : Nat;
    }]>>;
    userUsernames : Map.Map<Principal, Text>;
    newCategoryChannelOrders : Map.Map<Nat, {
      categoryOrder : [Nat];
      categories : [(
        {
          id : Nat;
          textChannels : [Nat];
          voiceChannels : [Nat];
        }
      )];
    }>;
  };

  type NewActor = {
    sessionStore : Map.Map<Text, {
      token : Text;
      accountId : Text;
      expiresAt : Int;
      email : ?Text;
    }>;
    userProfiles : Map.Map<Principal, {
      name : Text;
      aboutMe : Text;
      customStatus : Text;
      avatarUrl : Text;
      bannerUrl : Text;
      badges : [Text];
    }>;
  };

  public func run(old : OldActor) : NewActor {
    {
      sessionStore = Map.empty<Text, {
        token : Text;
        accountId : Text;
        expiresAt : Int;
        email : ?Text;
      }>();
      userProfiles = old.userProfiles;
    };
  };
};
