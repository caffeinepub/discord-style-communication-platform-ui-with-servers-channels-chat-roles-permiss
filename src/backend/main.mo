import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Auth "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let credentialsStore = Map.empty<Principal, Credentials>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var accessControlState : Auth.AccessControlState = Auth.initState();

  type RegisterPayload = {
    username : Text;
    email : Text;
    password : Text;
  };

  type LoginPayload = {
    loginIdentifier : Text;
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

  public type RegistrationResult = {
    #success;
    #error : RegistrationError;
  };

  public type RegistrationError = {
    #alreadyRegistered;
    #usernameTaken;
    #emailTaken;
    #unknown;
  };

  public type Session = {
    token : Text;
    expiresAt : Int;
    email : Text;
  };

  public type Credentials = {
    username : Text;
    email : Text;
    password : Text;
    principal : Principal;
  };

  include MixinAuthorization(accessControlState);

  // Converts everything to lowercase and trims spaces.
  func sanitizeText(input : Text) : Text {
    let trimmed = input.trimStart(#char(' '));
    let trimmedEnd = trimmed.trimEnd(#char(' '));
    trimmedEnd.toLower();
  };

  // Register a new user in the backend.
  public shared ({ caller }) func register(payload : RegisterPayload) : async RegistrationResult {
    let sanitizedUsername = sanitizeText(payload.username);
    let sanitizedEmail = sanitizeText(payload.email);

    // Check if the caller principal already exists in credentialsStore
    if (credentialsStore.containsKey(caller)) {
      return #error(#alreadyRegistered);
    };

    // Check if the username is already taken (case-insensitive check)
    let usernameExists = credentialsStore.values().any(
      func(credentials) {
        credentials.username.toLower() == sanitizedUsername
      }
    );

    if (usernameExists) {
      return #error(#usernameTaken);
    };

    // Check if the email is already taken (case-insensitive)
    let emailExists = credentialsStore.values().any(
      func(credentials) { credentials.email.toLower() == sanitizedEmail }
    );

    if (emailExists) {
      return #error(#emailTaken);
    };

    let credentials : Credentials = {
      username = sanitizedUsername;
      email = sanitizedEmail;
      password = payload.password;
      principal = caller;
    };

    // Store credentials for the principal
    credentialsStore.add(caller, credentials);

    // Create initial user profile
    let initialProfile : UserProfile = {
      name = sanitizedUsername;
      aboutMe = "";
      customStatus = "";
      avatarUrl = "";
      bannerUrl = "";
      badges = [];
    };
    userProfiles.add(caller, initialProfile);

    // Assign default "user" role to the newly registered account
    // This must not trap - catch any errors and return appropriate error result
    try {
      Auth.assignRole(accessControlState, caller, caller, #user);
      #success;
    } catch (e) {
      // If role assignment fails, return error instead of trapping
      // Clean up the registration data
      credentialsStore.remove(caller);
      userProfiles.remove(caller);
      #error(#unknown);
    };
  };

  public shared ({ caller }) func login(payload : LoginPayload) : async ?Session {
    let sanitizedIdentifier = sanitizeText(payload.loginIdentifier);

    // Try to find by username or email (case-insensitive)
    let credentialsOpt = credentialsStore.values().find(
      func(creds) {
        creds.username.toLower() == sanitizedIdentifier or creds.email.toLower() == sanitizedIdentifier
      }
    );

    switch (credentialsOpt) {
      case (null) { null };
      case (?credentials) {
        if (credentials.password != payload.password) {
          return null;
        };

        // Verify the caller matches the stored principal
        if (caller != credentials.principal) {
          return null;
        };

        let token = credentials.principal.toText().concat("_").concat(Time.now().toText());
        let session : Session = {
          token;
          expiresAt = Time.now() + 86_400_000_000_000;
          email = credentials.email;
        };

        ?session;
      };
    };
  };

  // Profile Management
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
};
