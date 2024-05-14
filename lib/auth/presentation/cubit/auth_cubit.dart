import 'package:bloc/bloc.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:meta/meta.dart';
import 'package:parse_server_sdk_flutter/parse_server_sdk_flutter.dart';
import 'package:tanya/core/cubit/loading_cubit.dart';
import 'package:tanya/core/cubit/navigator_cubit.dart';
import 'package:tanya/core/ioc.dart';

part 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  AuthCubit() : super(AuthInitial());
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  ParseUser? currentUser;
  String verificationId = '';
  String loginPoneNumber = '';
  String userName = '';
  String otp = '';
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
    if (user != null) {
      await user.logout();
    }

    await _googleSignIn.signOut();
    currentUser = null;
    emit(UserLogedOut());
    // print('loggggg 2');
    // print(loggggg);
    // var response = await user.logOut();
    // print(response);
  }

  void loginWithPhone() async {
    locator
        .get<LoadingCubit>()
        .emit(LoadingStateChanged(loading: true, text: 'אנא המתן'));
    if (this.verificationId.isNotEmpty && this.otp.length == 6) {
      verifyOtp(otp);
    } else {
      await FirebaseAuth.instance.verifyPhoneNumber(
        phoneNumber: '+972534261676',
        verificationCompleted: (PhoneAuthCredential credential) {
          print('verificationCompleted');
          print(credential);
          locator.get<LoadingCubit>().emit(LoadingStateChanged(loading: false));
        },
        verificationFailed: (FirebaseAuthException e) {
          print('verificationFailed');
          print(e);
          locator.get<LoadingCubit>().emit(LoadingStateChanged(loading: false));
        },
        codeSent: (String verificationId, int? resendToken) {
          print('codeSent');
          print(verificationId);
          emit(OtpSent());
          this.verificationId = verificationId;
          locator.get<LoadingCubit>().emit(LoadingStateChanged(loading: false));
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          print('codeAutoRetrievalTimeout');
          locator.get<LoadingCubit>().emit(LoadingStateChanged(loading: false));
        },
      );
    }
  }

  void verifyOtp(String smsCode) async {
    print('verifyOtp');
    print(verificationId);
    FirebaseAuth auth = FirebaseAuth.instance;

    // Create a PhoneAuthCredential with the code
    PhoneAuthCredential credential = PhoneAuthProvider.credential(
        verificationId: verificationId, smsCode: smsCode);
    print('verifyOtp 2');
    // Sign the user in (or link) with the credential
    try {
      UserCredential cred = await auth.signInWithCredential(credential);
      var parseUser = ParseUser(
          loginPoneNumber, loginPoneNumber, '$loginPoneNumber@socialtanya.com');

      var response = await parseUser.signUp();
      if (!response.success) {
        response = await parseUser.login();
      }
      if (response.success) {
        parseUser = response.result;
      }
      parseUser = await ParseUser.currentUser() as ParseUser;
      print('parseUser');
      print(parseUser);
      parseUser.set('displayName', userName);
      currentUser = parseUser;
      await parseUser.save();
      locator.get<LoadingCubit>().emit(LoadingStateChanged(loading: false));
      emit(UserReady(parseUser));
      print('verifyOtp 3');
      print(cred);
    } on Exception catch (e) {
      print('error');
      print(e);
      // TODO
    }
  }
}
