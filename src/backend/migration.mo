import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
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
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    {
      userProfiles = Map.empty<Principal, UserProfile>();
    };
  };
};
