import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type Credentials = {
    username : Text;
    email : Text;
    password : Text;
    accountId : Text;
    principal : Principal;
  };

  type OldActor = {
    credentialsByUsername : Map.Map<Text, Credentials>;
    credentialsByEmail : Map.Map<Text, Credentials>;
  };

  type NewActor = {
    credentialsByUsername : Map.Map<Text, Credentials>;
    credentialsByEmail : Map.Map<Text, Credentials>;
    credentialsByPrincipal : Map.Map<Principal, Credentials>;
  };

  public func run(old : OldActor) : NewActor {
    let credentialsByPrincipal = Map.empty<Principal, Credentials>();

    // Populate the new principal index from credentialsByUsername
    for ((_, credentials) in old.credentialsByUsername.entries()) {
      credentialsByPrincipal.add(credentials.principal, credentials);
    };

    {
      old with
      credentialsByPrincipal
    };
  };
};
