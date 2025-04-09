import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:parse_server_sdk_flutter/parse_server_sdk_flutter.dart';
import 'package:tanya/auth/presentation/login_page.dart';
import 'package:tanya/auth/presentation/login_page_desktop.dart';
import 'package:tanya/core/cubit/navigator_cubit.dart';
import 'package:tanya/core/ioc.dart';
import 'package:tanya/core/size_config.dart';
import 'package:tanya/core/widgets/loading_widget.dart';
import 'package:tanya/firebase_options.dart';
import 'package:google_fonts/google_fonts.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  await Parse().initialize('480c8e46-1901-44ab-9b6c-b00d0e3c3416',
      'https://tanya.dvarmalchus.co.il/parse',
      masterKey: 'smsLaravMyMasterKey');

  // await Parse().initialize('APPLICATION_ID', 'http://localhost:3001/parse',
  //     masterKey: 'MASTER_KEY');
  await setupLocator();
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool sizeInited = false;
  Key key = UniqueKey();
  // This widget is the root of your application.

  @override
  void initState() {
    locator.get<NavigatorCubit>().stream.listen((event) {
      if (event is LogOut || event is RefreshApp) {
        setState(() {
          key = UniqueKey();
        });
      }
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    if (!sizeInited) {
      sizeInited = true;
      SizeConfig().init(context);
    }
    return MaterialApp(
      builder: LoadingScreen.init(),
      key: key,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        textTheme: GoogleFonts.assistantTextTheme(textTheme).copyWith(
          bodyMedium: GoogleFonts.assistant(textStyle: textTheme.bodyMedium),
        ),
        useMaterial3: true,
        colorScheme: ColorScheme.fromSwatch(accentColor: Colors.blue),
      ),
      home: Directionality(
        textDirection: TextDirection.rtl,
        child: isDesktop() ? const DesktopLoginWidget() : const LoginWidget(),
      ),
    );
  }
}
