import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldSession = {
    token : Text;
    accountId : ?Text;
    expiresAt : Int;
    email : Text;
  };

  type OldActor = {
    sessionStore : Map.Map<Text, OldSession>;
    principalToToken : Map.Map<Principal, Text>;
  };

  type NewSession = {
    token : Text;
    accountId : ?Text;
    expiresAt : Int;
    email : Text;
    principal : Principal;
  };

  type NewActor = {
    sessionStore : Map.Map<Text, NewSession>;
  };

  public func run(old : OldActor) : NewActor {
    let newSessionStore = Map.empty<Text, NewSession>();
    { sessionStore = newSessionStore };
  };
};
