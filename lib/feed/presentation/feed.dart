import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_svg/svg.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:tanya/auth/presentation/cubit/auth_cubit.dart';
import 'package:tanya/core/consts/assets.dart';
import 'package:tanya/core/consts/globals.dart';
import 'package:tanya/core/cubit/navigator_cubit.dart';
import 'package:tanya/core/cubit/socketio_cubit.dart';
import 'package:tanya/core/ioc.dart';
import 'package:tanya/core/size_config.dart';
import 'package:tanya/feed/cubit/feed_cubit.dart';
import 'package:tanya/feed/group.dart';

class MainFeedWidget extends StatefulWidget {
  const MainFeedWidget({super.key});

  @override
  State<MainFeedWidget> createState() => _MainFeedWidgetState();
}

class _MainFeedWidgetState extends State<MainFeedWidget>
    with SingleTickerProviderStateMixin {
  int currentPageIndex = 0;
  int currentTabsIndex = 0;
  double userNameSize = SizeConfig.screenWidth * 0.06;
  double subTitleSize = SizeConfig.screenWidth * 0.05;
  Color unselectedTabColor = const Color(0x00FFFFFF);
  Color selectedTabColor = const Color(0xFF04478E);
  Color unselectedTextColor = const Color(0xFF04478E);
  Color mainColor = const Color(0xFF04478E);
  late TabController _tabController;
  EdgeInsets tabsPadding = const EdgeInsets.only(top: 5, bottom: 5);

  TextStyle tabsTextStyle = TextStyle(
      fontSize: SizeConfig.screenWidth * 0.03,
      color: Colors.white,
      fontWeight: FontWeight.bold);

  TextStyle unselectedTabsTextStyle = TextStyle(
      fontSize: SizeConfig.screenWidth * 0.03, color: const Color(0xFF04478E));
  @override
  void initState() {
    locator.get<SocketioCubit>().init();
    locator.get<SocketioCubit>().getUserCount();

    locator.get<FeedCubit>().init();
    locator.get<FeedCubit>().getGroups();
    locator.get<FeedCubit>().getDedication();
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      setState(() {
        currentTabsIndex = _tabController.index;
      });
    });

    locator.get<AuthCubit>().stream.listen((event) {
      if (event is UserLogedOut) {
        locator.get<NavigatorCubit>().showLoginScreen(context);
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: NavigationBarTheme(
        data: NavigationBarThemeData(
          surfaceTintColor: Colors.white,
          labelTextStyle: WidgetStateProperty.resolveWith<TextStyle>(
            (Set<WidgetState> states) => states.contains(WidgetState.selected)
                ? const TextStyle(
                    color: Color(0xFF04478E), fontWeight: FontWeight.bold)
                : const TextStyle(
                    color: Color(0xFF04478E), fontWeight: FontWeight.bold),
          ),
        ),
        child: NavigationBar(
          onDestinationSelected: (int index) {
            setState(() {
              currentPageIndex = index;
            });
          },
          backgroundColor: Colors.white,
          indicatorColor: const Color(0xFF04478E),
          selectedIndex: currentPageIndex,
          destinations: [
            NavigationDestination(
              icon: Badge(
                child: Image.asset(
                  TanyaIcons.profile,
                  height: 25,
                  color: currentPageIndex == 0 ? Colors.white : null,
                ),
              ),
              label: 'אישי',
            ),
            NavigationDestination(
              icon: Image.asset(
                TanyaIcons.arabic,
                height: 25,
                color: currentPageIndex == 1 ? Colors.white : null,
              ),
              label: 'תניא בערבית',
            ),
            NavigationDestination(
              icon: Image.asset(
                TanyaIcons.listing,
                height: 25,
                color: currentPageIndex == 2 ? Colors.white : null,
              ),
              label: 'תניא מוקלט',
            ),
            NavigationDestination(
              icon: Image.asset(
                TanyaIcons.menu_book,
                height: 25,
                color: currentPageIndex == 3 ? Colors.white : null,
              ),
              label: 'תניא יומי',
            ),
            NavigationDestination(
              icon: Image.asset(
                TanyaIcons.home,
                height: 25,
                color: currentPageIndex == 4 ? Colors.white : null,
              ),
              label: 'בית',
            ),
          ],
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xCF003A92),
              Color(0xFFE9F4FF),
              Color(0xFFE9F4FF),
              Color(0xFFE9F4FF),
            ],
          ),
        ),
        child: SafeArea(
          child: Stack(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      const SizedBox(
                        width: 10,
                      ),
                      if (locator
                              .get<AuthCubit>()
                              .currentUser
                              ?.get('photoUrl') !=
                          null)
                        ClipRRect(
                          borderRadius: BorderRadius.circular(36.0),
                          child: Image.network(
                            locator
                                .get<AuthCubit>()
                                .currentUser
                                ?.get('photoUrl'),
                            width: SizeConfig.screenWidth * 0.1,
                          ),
                        ),
                      if (locator
                              .get<AuthCubit>()
                              .currentUser
                              ?.get('photoUrl') ==
                          null)
                        const Icon(
                          FontAwesomeIcons.user,
                          color: Colors.white,
                        ),
                      const Spacer(),
                      Image.asset(TanyaIcons.tanya_logo),
                      const Spacer(),
                      GestureDetector(
                        onTap: () {
                          locator.get<AuthCubit>().logOut();
                        },
                        child: const Icon(
                          Icons.more_vert_rounded,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(
                        width: 10,
                      )
                    ],
                  ),
                  Padding(
                    padding: const EdgeInsets.only(right: 12.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          ' שלום, ',
                          textAlign: TextAlign.right,
                          textDirection: TextDirection.rtl,
                          style: TextStyle(
                              color: Colors.white, fontSize: userNameSize),
                        ),
                        Text(
                          locator.get<AuthCubit>().currentUser != null
                              ? locator
                                  .get<AuthCubit>()
                                  .currentUser!
                                  .get('displayName')
                                  .toString()
                                  .split(' ')[0]
                              : 'אורח',
                          textAlign: TextAlign.right,
                          textDirection: TextDirection.rtl,
                          style: TextStyle(
                              fontSize: userNameSize,
                              fontWeight: FontWeight.bold,
                              color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(right: 12.0),
                    child: Text(
                      'איזה ספרים תרצו להשלים היום?',
                      textDirection: TextDirection.rtl,
                      textAlign: TextAlign.right,
                      style: TextStyle(
                          color: Colors.white, fontSize: subTitleSize),
                    ),
                  ),
                  const SizedBox(
                    height: 20,
                  ),
                  Row(
                    // mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      const SizedBox(
                        width: 10,
                      ),
                      Expanded(
                        flex: 1,
                        child: GestureDetector(
                          onTap: () {
                            _tabController.index = 0;
                          },
                          child: Container(
                            padding: tabsPadding,
                            decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(color: mainColor),
                                color: currentTabsIndex == 0
                                    ? selectedTabColor
                                    : unselectedTabColor),
                            child: Column(
                              children: [
                                BlocBuilder<FeedCubit, FeedState>(
                                  bloc: locator.get(),
                                  buildWhen: (previous, current) =>
                                      current is GroupsReady,
                                  builder: (context, state) {
                                    var globalGroupsLength = 0;
                                    if (state is GroupsReady) {
                                      var userEmail = locator
                                          .get<AuthCubit>()
                                          .currentUser!
                                          .get('email');
                                      List<Group> globalGroups = state.groups
                                          .where((element) => !element.global!)
                                          .toList();
                                      globalGroupsLength = globalGroups.length;
                                    }
                                    return Text('$globalGroupsLength',
                                        style: currentTabsIndex == 0
                                            ? tabsTextStyle
                                            : unselectedTabsTextStyle);
                                  },
                                ),
                                Text(
                                  'ספרים כלליים',
                                  style: currentTabsIndex == 0
                                      ? tabsTextStyle
                                      : unselectedTabsTextStyle,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(
                        width: 10,
                      ),
                      Expanded(
                        flex: 1,
                        child: GestureDetector(
                          onTap: () {
                            _tabController.index = 1;
                          },
                          child: Container(
                            padding: tabsPadding,
                            decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(color: mainColor),
                                color: currentTabsIndex == 1
                                    ? selectedTabColor
                                    : unselectedTabColor),
                            child: Column(
                              children: [
                                BlocBuilder<FeedCubit, FeedState>(
                                  bloc: locator.get(),
                                  buildWhen: (previous, current) =>
                                      current is GroupsReady,
                                  builder: (context, state) {
                                    var sharedGroupsLength = 0;
                                    if (state is GroupsReady) {
                                      var userEmail = locator
                                          .get<AuthCubit>()
                                          .currentUser!
                                          .get('email');
                                      List<Group> sharedGroups = state.groups
                                          .where((element) => element.members!
                                              .contains(userEmail))
                                          .toList();
                                      sharedGroupsLength = sharedGroups.length;
                                    }
                                    return Text(
                                      '$sharedGroupsLength',
                                      style: currentTabsIndex == 1
                                          ? tabsTextStyle
                                          : unselectedTabsTextStyle,
                                    );
                                  },
                                ),
                                Text('ספרים ששותפו איתך',
                                    style: currentTabsIndex == 1
                                        ? tabsTextStyle
                                        : unselectedTabsTextStyle),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(
                        width: 10,
                      ),
                      Expanded(
                        flex: 1,
                        child: GestureDetector(
                          onTap: () {
                            _tabController.index = 2;
                          },
                          child: Container(
                            padding: tabsPadding,
                            decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(color: mainColor),
                                color: currentTabsIndex == 2
                                    ? selectedTabColor
                                    : unselectedTabColor),
                            child: Column(
                              children: [
                                BlocBuilder<FeedCubit, FeedState>(
                                  bloc: locator.get(),
                                  buildWhen: (previous, current) =>
                                      current is GroupsReady,
                                  builder: (context, state) {
                                    var myGroupsLength = 0;
                                    if (state is GroupsReady) {
                                      var userEmail = locator
                                          .get<AuthCubit>()
                                          .currentUser!
                                          .get('email');
                                      List<Group> myGroups = state.groups
                                          .where((element) =>
                                              element.ownerEmail == userEmail)
                                          .toList();
                                      myGroupsLength = myGroups.length;
                                    }
                                    return Text('$myGroupsLength',
                                        style: currentTabsIndex == 2
                                            ? tabsTextStyle
                                            : unselectedTabsTextStyle);
                                  },
                                ),
                                Text('ספרים פרטיים שלך',
                                    style: currentTabsIndex == 2
                                        ? tabsTextStyle
                                        : unselectedTabsTextStyle),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(
                        width: 10,
                      ),
                    ],
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  Expanded(
                    child: DefaultTabController(
                      initialIndex: 2,
                      length: 3,
                      child: Column(
                        children: [
                          // TabBar(
                          //   controller: _tabController,
                          //   dividerColor: Colors.transparent,
                          //   tabs: const [
                          //     Tab(text: 'ספרים כלליים'),
                          //     Tab(
                          //       text: 'שיתפו איתך',
                          //     ),
                          //     Tab(text: 'הספרים שלך'),
                          //   ],
                          // ),
                          BlocBuilder<FeedCubit, FeedState>(
                            bloc: locator.get(),
                            buildWhen: (previous, current) =>
                                current is GroupsReady,
                            builder: (context, state) {
                              if (state is GroupsReady) {
                                // state.groups.forEach((element) {
                                //   print(element.id);
                                //   print(element.ownerId);
                                //   print(element.ownerName);
                                // });
                                var userEmail = locator
                                    .get<AuthCubit>()
                                    .currentUser!
                                    .get('email');
                                List<Group> mygroup = state.groups
                                    .where((element) =>
                                        element.ownerEmail == userEmail)
                                    .toList();
                                List<Group> sharedGroups = state.groups
                                    .where((element) =>
                                        element.members!.contains(userEmail))
                                    .toList();
                                List<Group> globalGroups = state.groups
                                    .where((element) => !element.global!)
                                    .toList();
                                return Expanded(
                                  child: TabBarView(
                                    controller: _tabController,
                                    children: [
                                      GroupsList(groups: globalGroups),
                                      GroupsList(groups: sharedGroups),
                                      GroupsList(groups: mygroup),
                                    ],
                                  ),
                                );
                              } else {
                                return const Expanded(
                                  child: TabBarView(
                                    children: [
                                      SizedBox(),
                                      SizedBox(),
                                      SizedBox(),
                                    ],
                                  ),
                                );
                              }
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              BlocBuilder<SocketioCubit, SocketioState>(
                bloc: locator.get(),
                buildWhen: (previous, current) =>
                    current is SocketioConnectionsUpdated,
                builder: (context, state) {
                  if (state is SocketioConnectionsUpdated) {
                    return Positioned(
                        bottom: 0,
                        left: 0,
                        right: 0,
                        child: Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFFDAF2FF),
                            borderRadius: const BorderRadius.only(
                              topLeft: Radius.circular(20.0),
                              topRight: Radius.circular(20.0),
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withOpacity(0.5),
                                spreadRadius: 5,
                                blurRadius: 7,
                                offset: const Offset(
                                    0, 3), // changes position of shadow
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                  child: Text(
                                '${state.connections}\nמחוברים כעת',
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                    color: Color(0xFF04478E),
                                    fontWeight: FontWeight.bold),
                              )),
                              Expanded(
                                  child: Text(
                                '${state.members}\nמשתתפים פעילים',
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                    color: Color(0xFF04478E),
                                    fontWeight: FontWeight.bold),
                              )),
                            ],
                          ),
                        ));
                  } else {
                    return const SizedBox();
                  }
                },
              ),
              Positioned(
                bottom: 50,
                left: 10,
                child: GestureDetector(
                  onTap: () {
                    showPopup(context);
                  },
                  child: Container(
                    width: 60,
                    height: 60,
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: const Color(0xff027EC5),
                      borderRadius:
                          BorderRadius.circular(8), // Set small radius corners
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withOpacity(0.5), // Shadow color
                          spreadRadius: 3, // Spread radius
                          blurRadius: 3, // Blur radius
                          offset: const Offset(0, 2), // Shadow position
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        SvgPicture.asset(
                          TanyaIcons.book,
                          color: Colors.white,
                          height: 20,
                        ),
                        Text(
                          'לפתיחת\nספר חדש',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: SizeConfig.screenWidth * 0.025),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class GroupsList extends StatelessWidget {
  const GroupsList({
    super.key,
    required this.groups,
  });

  final List<Group> groups;

  @override
  Widget build(BuildContext context) {
    if (groups.isEmpty) {
      return Center(
          child: Text(
        'לא נמצאו ספרים',
        style: TextStyle(fontSize: SizeConfig.screenWidth * 0.05),
      ));
    }
    return ListView.builder(
      itemBuilder: (context, index) {
        if (groups.length == index) {
          return const SizedBox(
            height: 100,
          );
        }
        Group group = groups[index];
        double progress = group.book!.length / group.max!;
        // print('progress');
        // print(progress);
        // print('group');
        // print(group.toJson());
        return Container(
          margin: const EdgeInsets.all(8.0),
          decoration: BoxDecoration(
            border: Border.all(
              color: Colors.white, // Set border color here
              width: 2, // Set border width here
            ),
            borderRadius: const BorderRadius.all(
              Radius.circular(10), // Set specific border radius here
            ),
          ),
          child: Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.all(
                Radius.circular(10), // Set specific border radius here
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.only(
                  top: 12.0, bottom: 12, left: 15, right: 15),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                // crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      const Text('שיתוף'),
                      const Icon(
                        Icons.share_outlined,
                        size: 20,
                      ),
                      const SizedBox(
                        width: 25,
                      ),
                      Expanded(
                        flex: 1,
                        child: Text(
                          'ספר  ${booksType.where((bt) => bt['type'] == group.bookType).first['text']} ${index + 1}: ${group.name!}',
                          textAlign: TextAlign.right,
                          style: const TextStyle(
                              overflow: TextOverflow.ellipsis, fontSize: 16),
                          textDirection: TextDirection.rtl,
                          maxLines: 1,
                        ),
                      ),
                      const SizedBox(
                        width: 5,
                      ),
                      SvgPicture.asset(TanyaIcons.book),
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      ...group.members!.take(7).map(
                            (value) => Stack(
                              children: [
                                Positioned(
                                  top: 0,
                                  right: 0,
                                  child: Container(
                                    width:
                                        10, // Adjust the width according to your preference
                                    height:
                                        10, // Adjust the height according to your preference
                                    decoration: const BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: Colors
                                          .green, // Set indicator color (green for online)
                                    ),
                                  ),
                                ),
                                Container(
                                  margin: const EdgeInsets.only(left: 7),
                                  decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(
                                          width: 2, color: Colors.black)),
                                  child: const Icon(
                                    Icons.person,
                                    color: Colors.black,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      SizedBox(
                        width: SizeConfig.screenWidth * 0.06,
                      ),
                    ],
                  ),
                  const SizedBox(
                    height: 5,
                  ),
                  Align(
                    alignment: Alignment.centerRight,
                    child: Text(
                      '${group.book!.length}/${group.max}',
                      style: TextStyle(color: Colors.grey.shade700),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  Row(
                    children: [
                      Image.asset(
                        TanyaIcons.sun,
                        width: SizeConfig.screenWidth * 0.1,
                      ),
                      const Spacer(),
                      RotatedBox(
                        quarterTurns: 2,
                        child: SizedBox(
                          width: SizeConfig.screenWidth * 0.7,
                          child: ClipRRect(
                            borderRadius: const BorderRadius.only(
                                topRight: Radius.circular(10),
                                bottomRight: Radius.circular(10),
                                topLeft: Radius.circular(10),
                                bottomLeft: Radius.circular(10)),
                            child: LinearProgressIndicator(
                              value: !progress.isNaN ? progress : 0,
                              color: const Color(0xFF04478E),
                              minHeight: 5,
                              backgroundColor: const Color(0xFFE9F4FF),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(
                    height: 15,
                  ),
                  SizedBox(
                    height: 40,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        TextButton(
                          style: ButtonStyle(
                            shape: WidgetStateProperty.all<OutlinedBorder>(
                              RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(3.0),
                              ),
                            ),
                            backgroundColor: WidgetStateProperty.all<Color>(
                              const Color(0xff027EC5),
                            ),
                          ),
                          onPressed: () {
                            locator
                                .get<NavigatorCubit>()
                                .showPdfReader(context, group);
                          },
                          child: Text(
                            group.inProgress!.isEmpty
                                ? 'לתחילת הקריאה'
                                : 'להמשך קריאה',
                            style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Row(
                                children: [
                                  const Spacer(),
                                  Text(
                                      '${group.inProgress!.length} פרטים בקריאה כעת',
                                      textDirection: TextDirection.rtl),
                                  const SizedBox(
                                    width: 10,
                                  ),
                                  Container(
                                    width:
                                        10, // Adjust the width according to your preference
                                    height:
                                        10, // Adjust the height according to your preference
                                    decoration: const BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: Color(
                                          0xFF027EC5), // Set indicator color (green for online)
                                    ),
                                  ),
                                ],
                              ),
                              if (group.description!.isNotEmpty)
                                Row(
                                  children: [
                                    const Spacer(),
                                    Text(group.description!,
                                        textDirection: TextDirection.rtl),
                                    const SizedBox(
                                      width: 10,
                                    ),
                                    Image.asset(
                                      TanyaIcons.candle,
                                      height: 20,
                                    ),
                                  ],
                                )
                            ],
                          ),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
          ),
        );
      },
      itemCount: groups.length + 1,
    );
  }
}
