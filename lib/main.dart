import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:parse_server_sdk_flutter/parse_server_sdk_flutter.dart';
import 'package:tanya/auth/presentation/login_page.dart';
import 'package:tanya/core/ioc.dart';
import 'package:tanya/core/size_config.dart';
import 'package:tanya/firebase_options.dart';
import 'package:google_fonts/google_fonts.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  await Parse().initialize('APPLICATION_ID', 'http://localhost:1337/parse',
      masterKey: 'MASTER_KEY');
  await setupLocator();
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  bool sizeInited = false;

  MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    if (!sizeInited) {
      sizeInited = true;
      SizeConfig().init(context);
    }
    return MaterialApp(
      title: 'Flutter Demo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        textTheme: GoogleFonts.assistantTextTheme(textTheme).copyWith(
          bodyMedium: GoogleFonts.assistant(textStyle: textTheme.bodyMedium),
        ),
        useMaterial3: true,
        colorScheme: ColorScheme.fromSwatch(accentColor: Colors.blue),
      ),
      home: const Directionality(
        textDirection: TextDirection.rtl,
        child: LoginWidget(),
      ),
    );
  }
}
