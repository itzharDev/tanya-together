import 'package:bloc/bloc.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:meta/meta.dart';
import 'package:parse_server_sdk_flutter/parse_server_sdk_flutter.dart';

part 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  AuthCubit() : super(AuthInitial());
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  ParseUser? currentUser;
  void init() {
    ParseUser.currentUser().then(
      (user) {
        if (user == null) {
        } else {
          currentUser = user;
          emit(UserReady(currentUser!));
        }
      },
    );
  }

  void loginGoogle() async {
    try {
      final GoogleSignInAccount? googleSignInAccount =
          await _googleSignIn.signIn();
      final GoogleSignInAuthentication googleSignInAuthentication =
          await googleSignInAccount!.authentication;

      await ParseUser.loginWith(
          'google',
          google(
              googleSignInAuthentication.accessToken!,
              _googleSignIn.currentUser!.id,
              googleSignInAuthentication.idToken!));
      var parseUser = await ParseUser.currentUser() as ParseUser;
      parseUser.set('displayName', googleSignInAccount.displayName);
      parseUser.set('email', googleSignInAccount.email);
      parseUser.set('id', googleSignInAccount.id);
      parseUser.set('photoUrl', googleSignInAccount.photoUrl);
      currentUser = parseUser;
      await parseUser.save();
      emit(UserReady(parseUser));
    } catch (error) {
      print('error');
      print(error);
      return null;
    }
  }

  void logOut() async {
    var user = await ParseUser.currentUser();
    await user.logout();
    await _googleSignIn.signOut();
    currentUser = null;
    emit(UserLogedOut());
    // print('loggggg 2');
    // print(loggggg);
    // var response = await user.logOut();
    // print(response);
  }
}
