import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldSession = {
    token : Text;
    accountId : Text;
    expiresAt : Int;
    email : ?Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text; aboutMe : Text; customStatus : Text; avatarUrl : Text; bannerUrl : Text; badges : [Text] }>;
    sessionStore : Map.Map<Text, OldSession>;
  };

  type NewSession = {
    token : Text;
    accountId : ?Text;
    expiresAt : Int;
    email : Text;
  };

  type NewCredentials = {
    username : Text;
    email : Text;
    password : Text;
    accountId : Text;
    principal : Principal;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text; aboutMe : Text; customStatus : Text; avatarUrl : Text; bannerUrl : Text; badges : [Text] }>;
    sessionStore : Map.Map<Text, NewSession>;
    credentialsStore : Map.Map<Text, NewCredentials>;
    principalToToken : Map.Map<Principal, Text>;
  };

  public func run(old : OldActor) : NewActor {
    let newSessions = old.sessionStore.map<Text, OldSession, NewSession>(
      func(_key, oldSession) {
        {
          oldSession with
          accountId = ?oldSession.accountId;
          email = switch (oldSession.email) { case (null) { "" }; case (?e) { e } };
        };
      }
    );

    {
      userProfiles = old.userProfiles;
      sessionStore = newSessions;
      credentialsStore = Map.empty<Text, NewCredentials>();
      principalToToken = Map.empty<Principal, Text>();
    };
  };
};
