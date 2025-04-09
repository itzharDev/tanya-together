import 'package:custom_sliding_segmented_control/custom_sliding_segmented_control.dart';
import 'package:dio/dio.dart';
import 'package:dropdown_button2/dropdown_button2.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get_it/get_it.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:tanya/auth/presentation/cubit/auth_cubit.dart';
import 'package:tanya/core/consts/assets.dart';
import 'package:tanya/core/consts/globals.dart';
import 'package:tanya/core/cubit/loading_cubit.dart';
import 'package:tanya/core/cubit/navigator_cubit.dart';
import 'package:tanya/core/cubit/socketio_cubit.dart';
import 'package:tanya/core/size_config.dart';
import 'package:tanya/feed/cubit/feed_cubit.dart';

final locator = GetIt.instance;

Future<void> setupLocator({bool? firstSetup = true}) async {
  final dio = Dio();
  locator.registerSingleton<FeedCubit>(FeedCubit());
  locator.registerSingleton<NavigatorCubit>(NavigatorCubit());
  locator.registerSingleton<AuthCubit>(AuthCubit());
  locator.registerSingleton<LoadingCubit>(LoadingCubit());
  locator.registerSingleton<SocketioCubit>(SocketioCubit());
}

Set<String> _segmentedButtonSelection = <String>{'A'};
void showPopup(BuildContext context) {
  final List<dynamic> items = [
    {'text': 'זכות', 'icon': TanyaIcons.zhit, 'type': '1'},
    {'text': 'ע״נ', 'icon': TanyaIcons.dedication, 'type': '2'},
    {'text': 'הצלחה', 'icon': TanyaIcons.hazlaha, 'type': '3'},
    {'text': 'זחו״ק', 'icon': TanyaIcons.zarakayama, 'type': '4'},
    {'text': 'רפואה', 'icon': TanyaIcons.refua, 'type': '5'},
    {'text': 'אחר', 'icon': TanyaIcons.other, 'type': '7'},
  ];

  double textFieldHeight = 50;
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return Dialog(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        child: BlocConsumer<FeedCubit, FeedState>(
          listener: (context, state) {
            if (state is GroupCreated) {
              Navigator.of(context).pop();
            }
          },
          buildWhen: (previous, current) => current is NewGroupParamsChanged,
          bloc: locator.get(),
          builder: (context, state) {
            if (state is! NewGroupParamsChanged) {
              state = NewGroupParamsChanged(
                  groupType: 1,
                  groupDedication: '',
                  groupIntention: items[0]['type'],
                  bookType: booksType[0]['type']);
            }

            return Column(
              mainAxisSize: MainAxisSize.min,
              textDirection: TextDirection.rtl,
              // crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(
                  height: 20,
                ),
                Text(
                  'איזו התרגשות לפתוח ספר חדש!',
                  textDirection: TextDirection.rtl,
                  style: TextStyle(
                    color: const Color(0xFF04478E),
                    fontSize: SizeConfig.screenWidth * 0.04,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(
                  height: 10,
                ),
                const Text('הספר שלי הוא'),
                CustomSlidingSegmentedControl<int>(
                  fixedWidth: SizeConfig.screenWidth * 0.3,
                  height: 30,
                  initialValue: state.groupType,
                  children: {
                    2: Text(
                      'כללי',
                      style: TextStyle(
                          color: state.groupType == 2
                              ? Colors.white
                              : Colors.grey),
                    ),
                    1: Text(
                      'פרטי',
                      style: TextStyle(
                          color: state.groupType == 1
                              ? Colors.white
                              : Colors.grey),
                    ),
                  },
                  decoration: BoxDecoration(
                    color: CupertinoColors.white,
                    border: Border.all(
                      color: Colors.blue, // Set the border color
                      width: 2.0, // Set the border width
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  thumbDecoration: BoxDecoration(
                    color: const Color(0xFF027EC5),
                    borderRadius: BorderRadius.circular(6),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(.3),
                        blurRadius: 4.0,
                        spreadRadius: 1.0,
                        offset: const Offset(
                          0.0,
                          2.0,
                        ),
                      ),
                    ],
                  ),
                  duration: const Duration(milliseconds: 50),
                  curve: Curves.easeInToLinear,
                  onValueChanged: (v) {
                    locator.get<FeedCubit>().updateGroupType(state, v);
                  },
                ),
                const SizedBox(
                  height: 10,
                ),
                Container(
                  color: const Color(0xFFE9F4FF),
                  padding: const EdgeInsets.only(left: 20, right: 20),
                  child: Column(
                    children: [
                      const SizedBox(
                        height: 20,
                      ),
                      const Text(
                        'איזה ספר תרצו לחלק?',
                        textDirection: TextDirection.rtl,
                      ),
                      const SizedBox(
                        height: 5,
                      ),
                      SizedBox(
                        width: double.infinity,
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton2<String>(
                            isExpanded: true,
                            alignment: Alignment.centerRight,
                            hint: Row(
                              children: [
                                Image.asset(booksType[0]['icon']),
                                const SizedBox(
                                  width: 4,
                                ),
                                Expanded(
                                  child: Text(
                                    booksType[0]['text'],
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.black,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            items: booksType
                                .map((item) => DropdownMenuItem<String>(
                                      alignment: Alignment.centerRight,
                                      value: item['type'],
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.end,
                                        children: [
                                          Text(
                                            item['text'],
                                            textAlign: TextAlign.right,
                                            style: const TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.black,
                                            ),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(
                                            width: 5,
                                          ),
                                          Image.asset(
                                            item['icon'],
                                            width: 20,
                                          ),
                                        ],
                                      ),
                                    ))
                                .toList(),
                            value: state.bookType,
                            onChanged: (String? value) {
                              locator
                                  .get<FeedCubit>()
                                  .updateBookType(state, value);
                            },
                            buttonStyleData: ButtonStyleData(
                              height: 50,
                              width: 160,
                              padding:
                                  const EdgeInsets.only(left: 14, right: 14),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(
                                  color: Colors.grey,
                                ),
                                color: const Color(0xFFE9F4FF),
                              ),
                              elevation: 0,
                            ),
                            // iconStyleData: const IconStyleData(
                            //   icon: Icon(
                            //     Icons.arrow_forward_ios_outlined,
                            //   ),
                            //   iconSize: 14,
                            //   iconEnabledColor: Colors.yellow,
                            //   iconDisabledColor: Colors.grey,
                            // ),
                            dropdownStyleData: DropdownStyleData(
                              maxHeight: 200,
                              width: 250,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(14),
                                color: const Color(0xFFE9F4FF),
                              ),
                              offset: const Offset(0, 0),
                              scrollbarTheme: ScrollbarThemeData(
                                radius: const Radius.circular(40),
                                thickness: WidgetStateProperty.all<double>(6),
                                thumbVisibility:
                                    WidgetStateProperty.all<bool>(true),
                              ),
                            ),
                            menuItemStyleData: const MenuItemStyleData(
                              height: 40,
                              padding: EdgeInsets.only(left: 14, right: 14),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(
                        height: 20,
                      ),
                      SizedBox(
                        height: textFieldHeight,
                        child: TextField(
                          onChanged: (value) {
                            locator
                                .get<FeedCubit>()
                                .updateGroupName(state, value);
                          },
                          textDirection: TextDirection.rtl,
                          textAlign: TextAlign.right,
                          decoration: InputDecoration(
                            border: OutlineInputBorder(
                                borderSide: BorderSide(
                                    color: state.missingGroupName
                                        ? Colors.red
                                        : Colors.grey)),
                            enabledBorder: OutlineInputBorder(
                              borderSide: BorderSide(
                                  color: state.missingGroupName
                                      ? Colors.red
                                      : Colors.grey),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderSide: BorderSide(
                                  color: state.missingGroupName
                                      ? Colors.red
                                      : Colors.grey),
                            ),
                            label: const Align(
                              alignment: Alignment.centerRight,
                              child: Text(
                                'שם הספר / קבוצת קריאה',
                              ),
                            ),
                            labelStyle: const TextStyle(),
                          ),
                        ),
                      ),
                      const SizedBox(
                        height: 20,
                      ),
                      SizedBox(
                        height: textFieldHeight,
                        child: TextField(
                          onChanged: (value) {
                            locator
                                .get<FeedCubit>()
                                .updateGroupDescription(state, value);
                          },
                          textDirection: TextDirection.rtl,
                          textAlign: TextAlign.right,
                          decoration: InputDecoration(
                            border: OutlineInputBorder(
                                borderSide: BorderSide(
                                    color: state.missingGroupDescription
                                        ? Colors.red
                                        : Colors.grey)),
                            enabledBorder: OutlineInputBorder(
                              borderSide: BorderSide(
                                  color: state.missingGroupDescription
                                      ? Colors.red
                                      : Colors.grey),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderSide: BorderSide(
                                  color: state.missingGroupDescription
                                      ? Colors.red
                                      : Colors.grey),
                            ),
                            label: const Align(
                              alignment: Alignment.centerRight,
                              child: Text(
                                'תיאור קצר על הקבוצה',
                              ),
                            ),
                            labelStyle: const TextStyle(),
                          ),
                        ),
                      ),
                      const SizedBox(
                        height: 20,
                      ),
                      Row(
                        children: [
                          Expanded(
                            child: SizedBox(
                              height: textFieldHeight,
                              child: TextField(
                                onChanged: (value) {
                                  locator
                                      .get<FeedCubit>()
                                      .updateGroupDedication(state, value);
                                },
                                textDirection: TextDirection.rtl,
                                textAlign: TextAlign.right,
                                decoration: InputDecoration(
                                  border: OutlineInputBorder(
                                      borderSide: BorderSide(
                                          color: state.missingGroupDedication
                                              ? Colors.red
                                              : Colors.grey)),
                                  enabledBorder: OutlineInputBorder(
                                    borderSide: BorderSide(
                                        color: state.missingGroupDedication
                                            ? Colors.red
                                            : Colors.grey),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderSide: BorderSide(
                                        color: state.missingGroupDedication
                                            ? Colors.red
                                            : Colors.grey),
                                  ),
                                  label: const Align(
                                    alignment: Alignment.centerRight,
                                    child: Text(
                                      'הספר מוקדש ל',
                                    ),
                                  ),
                                  labelStyle: const TextStyle(),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(
                            width: 10,
                          ),
                          SizedBox(
                            width: 120,
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton2<String>(
                                isExpanded: true,
                                alignment: Alignment.centerRight,
                                hint: Row(
                                  children: [
                                    Image.asset(items[0]['icon']),
                                    const SizedBox(
                                      width: 4,
                                    ),
                                    Expanded(
                                      child: Text(
                                        items[0]['text'],
                                        style: const TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.black,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                                items: items
                                    .map((item) => DropdownMenuItem<String>(
                                          alignment: Alignment.centerRight,
                                          value: item['type'],
                                          child: Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.end,
                                            children: [
                                              Text(
                                                item['text'],
                                                textAlign: TextAlign.right,
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.black,
                                                ),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              const SizedBox(
                                                width: 5,
                                              ),
                                              Image.asset(
                                                item['icon'],
                                                width: 20,
                                              ),
                                            ],
                                          ),
                                        ))
                                    .toList(),
                                value: state.groupIntention,
                                onChanged: (String? value) {
                                  locator
                                      .get<FeedCubit>()
                                      .updateGroupIntention(state, value);
                                },
                                buttonStyleData: ButtonStyleData(
                                  height: 50,
                                  width: 160,
                                  padding: const EdgeInsets.only(
                                      left: 14, right: 14),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(4),
                                    border: Border.all(
                                      color: Colors.grey,
                                    ),
                                    color: const Color(0xFFE9F4FF),
                                  ),
                                  elevation: 0,
                                ),
                                // iconStyleData: const IconStyleData(
                                //   icon: Icon(
                                //     Icons.arrow_forward_ios_outlined,
                                //   ),
                                //   iconSize: 14,
                                //   iconEnabledColor: Colors.yellow,
                                //   iconDisabledColor: Colors.grey,
                                // ),
                                dropdownStyleData: DropdownStyleData(
                                  maxHeight: 200,
                                  width: 200,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(14),
                                    color: const Color(0xFFE9F4FF),
                                  ),
                                  offset: const Offset(-20, 0),
                                  scrollbarTheme: ScrollbarThemeData(
                                    radius: const Radius.circular(40),
                                    thickness:
                                        WidgetStateProperty.all<double>(6),
                                    thumbVisibility:
                                        WidgetStateProperty.all<bool>(true),
                                  ),
                                ),
                                menuItemStyleData: const MenuItemStyleData(
                                  height: 40,
                                  padding: EdgeInsets.only(left: 14, right: 14),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(
                        height: 20,
                      ),
                    ],
                  ),
                ),
                Container(
                  width: SizeConfig.screenWidth,
                  padding: const EdgeInsets.only(bottom: 20),
                  decoration: const BoxDecoration(
                    color: Color(0xFFE9F4FF),
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(16.0), // Bottom left corner
                      bottomRight: Radius.circular(16.0), // Bottom right corner
                    ),
                  ),
                  child: Align(
                    alignment: Alignment.center,
                    child: SizedBox(
                      width: SizeConfig.screenWidth * 0.6,
                      child: TextButton(
                        style: ButtonStyle(
                          shape: WidgetStateProperty.all<OutlinedBorder>(
                            RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(3.0),
                            ),
                          ),
                          backgroundColor: WidgetStateProperty.all<Color>(
                              const Color(0xff027EC5)),
                        ),
                        onPressed: () {
                          locator.get<FeedCubit>().createGroup(state);
                        },
                        child: Text(
                          'צור קבוצה',
                          style: GoogleFonts.assistant(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: SizeConfig.screenWidth * 0.05),
                        ),
                      ),
                    ),
                  ),
                )
              ],
            );
          },
        ),
        // contentPadding: EdgeInsets.zero,
        // title: Text(
        //   'איזו התרגשות! לפתוח ספר חדש!',
        //   textDirection: TextDirection.rtl,
        // ),
        // content: Container(
        //   color: Color(0xffE9F4FF),
        //   child: Column(
        //     mainAxisSize: MainAxisSize.min,
        //     children: [
        //       Text('This is the content of the popup.'),
        //       Text('This is the content of the popup.'),
        //     ],
        //   ),
        // ),
        // actions: <Widget>[
        //   TextButton(
        //     child: Text('Close'),
        //     onPressed: () {
        //       Navigator.of(context).pop();
        //     },
        //   ),
        // ],
      );
    },
  );
}

bool isDesktop() {
  return kIsWeb &&
      (defaultTargetPlatform == TargetPlatform.linux ||
          defaultTargetPlatform == TargetPlatform.macOS ||
          defaultTargetPlatform == TargetPlatform.windows ||
          defaultTargetPlatform == TargetPlatform.fuchsia);
  // return kIsWeb && (Platform.isMacOS || Platform.isWindows || Platform.isLinux);
}
