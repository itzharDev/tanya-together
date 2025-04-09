import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:tanya/core/consts/assets.dart';

import 'package:tanya/core/ioc.dart';
import 'package:tanya/core/size_config.dart';
import 'package:tanya/feed/cubit/feed_cubit.dart';
import 'package:tanya/feed/group.dart';

class ReaderViewWidget extends StatefulWidget {
  Group group;
  ReaderViewWidget(this.group, {super.key});

  @override
  State<ReaderViewWidget> createState() => _ReaderViewWidgetState();
}

class _ReaderViewWidgetState extends State<ReaderViewWidget> {
  int part = 0;
  bool _isLoading = true;
  WebViewController? _webViewController;
  bool _isWebViewInitialized = false;
  Key _webViewKey = UniqueKey();
  @override
  void initState() {
    List<int> ex = [];

    if (widget.group.book != null && widget.group.book!.isNotEmpty) {
      for (var value in widget.group.book!) {
        ex.add(int.parse(value));
      }
    }

    if (widget.group.inProgress != null &&
        widget.group.inProgress!.isNotEmpty) {
      for (var value in widget.group.inProgress!) {
        ex.add(int.parse(value));
      }
    }
    print('widget.group.max');
    print(widget.group.max);
    print('ex');
    print(ex);
    part = locator
        .get<FeedCubit>()
        .getRandomWithExclusion(1, widget.group.max!, ex);
    print('part');
    print(part);
    // Add the current part to inProgress if not already there
    if (!widget.group.inProgress!.contains(part.toString())) {
      widget.group.inProgress!.add(part.toString());
      locator.get<FeedCubit>().updateGroup(widget.group);
    }

    super.initState();
  }

  @override
  void dispose() {
    // Clean up the WebViewController when the widget is disposed
    _webViewController = null;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    String pdf = '';
    if (widget.group.bookType == '1') {
      //tanya
      pdf = "https://s3.amazonaws.com/DvarMalchus/tanya/socialTanya/$part.pdf";
    } else if (widget.group.bookType == '2') {
      //tehilim
      // pdf = "https://s3.amazonaws.com/DvarMalchus/tehilim/social/$part.pdf";
      String hebrewPart = _getHebrewGematria(part);
      pdf = "https://nerlazadik.co.il/תהילים/תהילים-פרק-$hebrewPart/";
    } else if (widget.group.bookType == '3') {
      //mishnayot
      pdf = "https://s3.amazonaws.com/DvarMalchus/tanya/socialTanya/$part.pdf";
    }
    double progress = widget.group.book!.length / widget.group.max!;
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xCF003A92),
            Color(0xFFE9F4FF),
            Color(0xFFE9F4FF),
            Color(0xFFE9F4FF),
            Color(0xFFE9F4FF),
          ],
        ),
      ),
      child: SafeArea(
        child: Stack(
          children: [
            Positioned.fill(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      const SizedBox(
                        width: 10,
                      ),
                      GestureDetector(
                        onTap: () {
                          // Remove the current part from inProgress before going back
                          setState(() {
                            widget.group.inProgress!.remove(part.toString());
                          });
                          locator.get<FeedCubit>().updateGroup(widget.group);
                          Navigator.of(context).pop();
                        },
                        child: const Icon(
                          Icons.arrow_back_ios_new,
                          color: Colors.white,
                          size: 30,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        'ספר ${widget.group.name!}',
                        textDirection: TextDirection.rtl,
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: SizeConfig.screenWidth * 0.05,
                            fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(
                        width: 10,
                      ),
                      SvgPicture.asset(
                        TanyaIcons.book,
                        color: Colors.white,
                        height: 30,
                      ),
                      const SizedBox(
                        width: 10,
                      ),
                      GestureDetector(
                        onTap: () {
                          Navigator.of(context).pop();
                        },
                        child: const Icon(
                          Icons.more_vert_sharp,
                          color: Colors.white,
                          size: 30,
                        ),
                      ),
                      const SizedBox(
                        width: 10,
                      ),
                    ],
                  ),
                  const SizedBox(
                    height: 20,
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 30, right: 30),
                    child: Row(
                      children: [
                        const Text(
                          'סיום הספר',
                          style: TextStyle(color: Colors.white),
                        ),
                        const Spacer(),
                        Text(
                          '${widget.group.book!.length}/${widget.group.max}',
                          style: const TextStyle(color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 30, right: 30),
                    child: Row(
                      children: [
                        Expanded(
                          child: RotatedBox(
                            quarterTurns: 2,
                            child: SizedBox(
                              child: ClipRRect(
                                borderRadius: const BorderRadius.only(
                                    topRight: Radius.circular(10),
                                    bottomRight: Radius.circular(10),
                                    topLeft: Radius.circular(10),
                                    bottomLeft: Radius.circular(10)),
                                child: LinearProgressIndicator(
                                  value: progress,
                                  color: const Color(0xFF04478E),
                                  minHeight: 5,
                                  backgroundColor: const Color(0xFFE9F4FF),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 30, right: 30),
                    child: Row(
                      children: [
                        const Spacer(),
                        Text(
                          '${widget.group.inProgress!.length} פרקים בקריאה כעת',
                          textDirection: TextDirection.rtl,
                          style: const TextStyle(
                            color: Color(0xFF04478E),
                          ),
                        ),
                        const SizedBox(
                          width: 5,
                        ),
                        Image.asset(
                          TanyaIcons.sunglasses,
                          height: 15,
                        )
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 30, right: 30),
                    child: Row(
                      children: [
                        const Spacer(),
                        Text(
                          '${widget.group.description}',
                          textDirection: TextDirection.rtl,
                          style: const TextStyle(
                            color: Color(0xFF04478E),
                          ),
                        ),
                        const SizedBox(
                          width: 5,
                        ),
                        Image.asset(
                          TanyaIcons.crown,
                          height: 15,
                        )
                      ],
                    ),
                  ),
                  const SizedBox(
                    height: 20,
                  ),
                  Expanded(
                    child: widget.group.bookType == '2'
                        ? Stack(
                            children: [
                              FutureBuilder(
                                key: _webViewKey,
                                future: _initializeWebView(pdf),
                                builder: (context, snapshot) {
                                  if (snapshot.connectionState ==
                                          ConnectionState.done &&
                                      snapshot.data != null) {
                                    return WebViewWidget(
                                        controller: snapshot.data!);
                                  }
                                  return const SizedBox.shrink();
                                },
                              ),
                              if (_isLoading)
                                Container(
                                  color: const Color(0xFFE9F4FF),
                                  child: const Center(
                                    child: CircularProgressIndicator(
                                      color: Color(0xFF04478E),
                                    ),
                                  ),
                                ),
                            ],
                          )
                        : SfPdfViewer.network(
                            pdf,
                          ),
                  ),
                ],
              ),
            ),
            Positioned(
              bottom: 10,
              left: 10,
              child: GestureDetector(
                onTap: () {
                  // Move the part from inProgress to book array
                  setState(() {
                    widget.group.inProgress!.remove(part.toString());
                    if (!widget.group.book!.contains(part.toString())) {
                      widget.group.book!.add(part.toString());
                    }
                  });
                  locator.get<FeedCubit>().updateGroup(widget.group);
                  locator
                      .get<FeedCubit>()
                      .getGroups(); // Reload groups before popping
                  Navigator.of(context).pop();
                },
                child: Container(
                  width: 60,
                  height: 60,
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: const Color(0xff10AC52),
                    borderRadius:
                        BorderRadius.circular(8), // Set small radius corners
                    boxShadow: [
                      BoxShadow(
                        color:
                            Colors.grey.withValues(alpha: 0.5), // Shadow color
                        spreadRadius: 3, // Spread radius
                        blurRadius: 3, // Blur radius
                        offset: const Offset(0, 2), // Shadow position
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Image.asset(
                        TanyaIcons.vi,
                        color: Colors.white,
                        height: 20,
                      ),
                      Text(
                        'סיימתי את הפרק',
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
            Positioned(
              bottom: 10,
              right: 10,
              child: GestureDetector(
                onTap: () async {
                  // Remove the current part from inProgress before fetching a new part
                  setState(() {
                    widget.group.inProgress!.remove(part.toString());
                  });

                  // Update the group on the server
                  await locator.get<FeedCubit>().updateGroup(widget.group);

                  // Fetch the latest group data from the server
                  Group? updatedGroup =
                      await locator.get<FeedCubit>().getGroup(widget.group.id!);

                  // Update the local group with the latest data
                  if (updatedGroup != null) {
                    setState(() {
                      widget.group = updatedGroup;
                    });
                  }

                  // Get a list of excluded parts (already read or in progress)
                  List<int> ex = [];
                  if (widget.group.book != null &&
                      widget.group.book!.isNotEmpty) {
                    for (var value in widget.group.book!) {
                      ex.add(int.parse(value));
                    }
                  }

                  if (widget.group.inProgress != null &&
                      widget.group.inProgress!.isNotEmpty) {
                    for (var value in widget.group.inProgress!) {
                      ex.add(int.parse(value));
                    }
                  }

                  // Get a new random part that's not in the excluded list
                  part = locator
                      .get<FeedCubit>()
                      .getRandomWithExclusion(1, widget.group.max!, ex);

                  // Add the new part to inProgress if not already there
                  if (!widget.group.inProgress!.contains(part.toString())) {
                    widget.group.inProgress!.add(part.toString());
                    locator.get<FeedCubit>().updateGroup(widget.group);
                  }

                  // Load the new URL for the page with the new part generated
                  String newPdfUrl = '';
                  if (widget.group.bookType == '1') {
                    //tanya
                    newPdfUrl =
                        "https://s3.amazonaws.com/DvarMalchus/tanya/socialTanya/$part.pdf";
                  } else if (widget.group.bookType == '2') {
                    //tehilim
                    String hebrewPart = _getHebrewGematria(part);
                    newPdfUrl =
                        "https://nerlazadik.co.il/תהילים/תהילים-פרק-$hebrewPart/";
                  } else if (widget.group.bookType == '3') {
                    //mishnayot
                    newPdfUrl =
                        "https://s3.amazonaws.com/DvarMalchus/tanya/socialTanya/$part.pdf";
                  }

                  // Reset the WebView state and reinitialize with the new URL
                  setState(() {
                    _isLoading = true;
                    _isWebViewInitialized = false;
                    _webViewController = null;
                    _webViewKey = UniqueKey();
                  });

                  // Wait for the next frame to ensure the old WebView is disposed
                  await Future.microtask(() {});

                  // Reinitialize the WebView with the new URL
                  _initializeWebView(newPdfUrl);
                },
                child: Container(
                  width: 60,
                  height: 60,
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: const Color(0xffF2B04C),
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
                      Image.asset(
                        TanyaIcons.another,
                        color: Colors.white,
                        height: 20,
                      ),
                      Text(
                        'רוצה פרק אחר',
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
            )
          ],
        ),
      ),
    );
  }

  String _getHebrewGematria(int number) {
    if (number <= 0) return '';

    // Special cases for 15 and 16
    if (number == 15) return 'טו';
    if (number == 16) return 'טז';

    final units = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    final tens = ['י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];

    if (number <= 9) {
      return units[number - 1];
    } else if (number == 10) {
      return 'י';
    } else if (number < 20) {
      return 'י' + units[number - 11];
    } else if (number == 20) {
      return 'כ';
    } else if (number < 30) {
      return 'כ' + units[number - 21];
    } else if (number == 30) {
      return 'ל';
    } else if (number < 40) {
      return 'ל' + units[number - 31];
    } else if (number == 40) {
      return 'מ';
    } else if (number < 50) {
      return 'מ' + units[number - 41];
    } else if (number == 50) {
      return 'נ';
    } else if (number < 60) {
      return 'נ' + units[number - 51];
    } else if (number == 60) {
      return 'ס';
    } else if (number < 70) {
      return 'ס' + units[number - 61];
    } else if (number == 70) {
      return 'ע';
    } else if (number < 80) {
      return 'ע' + units[number - 71];
    } else if (number == 80) {
      return 'פ';
    } else if (number < 90) {
      return 'פ' + units[number - 81];
    } else if (number == 90) {
      return 'צ';
    } else if (number < 100) {
      return 'צ' + units[number - 91];
    } else if (number == 100) {
      return 'ק';
    } else if (number < 110) {
      return 'ק' + units[number - 101];
    } else if (number == 110) {
      return 'קי';
    } else if (number < 120) {
      return 'קי' + units[number - 111];
    } else if (number == 120) {
      return 'קכ';
    } else if (number < 130) {
      return 'קכ' + units[number - 121];
    } else if (number == 130) {
      return 'קל';
    } else if (number < 140) {
      return 'קל' + units[number - 131];
    } else if (number == 140) {
      return 'קמ';
    } else if (number < 150) {
      return 'קמ' + units[number - 141];
    }

    return number.toString(); // Fallback for numbers > 150
  }

  Future<WebViewController> _initializeWebView(String pdf) async {
    if (_webViewController != null) {
      return _webViewController!;
    }

    final controller = WebViewController();

    // Configure the controller first
    controller
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (String url) async {
            if (!_isWebViewInitialized) {
              _isWebViewInitialized = true;

              // Get the Hebrew gematria for the current part
              String hebrewPart = _getHebrewGematria(part);

              await controller.runJavaScript('''
                // Immediately inject CSS to hide everything and style content
                const style = document.createElement('style');
                style.textContent = \`
                  body > *:not(.psalm-content) { display: none !important; }
                  body { background-color: #E9F4FF !important; }
                  
                  .elementor-widget-theme-post-content p,
                  .elementor-widget-theme-post-content span,
                  .elementor-widget-theme-post-content li,
                  .elementor-widget-theme-post-content strong,
                  .psalm-content p,
                  .psalm-content span,
                  .psalm-content li,
                  .psalm-content strong {
                    font-family: "Noto Serif Hebrew", serif !important;
                    font-size: 24px !important;
                    font-weight: 800 !important;
                    text-align: justify !important;
                  }
                  
                  .psalm-title {
                    font-family: "Noto Serif Hebrew", serif !important;
                    font-size: 32px !important;
                    font-weight: 900 !important;
                    text-align: center !important;
                    margin-bottom: 20px !important;
                    color: #04478E !important;
                  }
                \`;
                document.head.appendChild(style);
                
                // Create and populate container
                const container = document.createElement('div');
                container.className = 'psalm-content';
                container.style.padding = '20px';
                
                // Use the Hebrew gematria passed from Flutter
                const chapterNumber = '$hebrewPart';
                
                // Create title element
                const titleElement = document.createElement('h2');
                titleElement.className = 'psalm-title';
                titleElement.textContent = \`פרק \${chapterNumber}\`;
                container.appendChild(titleElement);
                
                // Create wrapper div
                const wrapperDiv = document.createElement('div');
                wrapperDiv.className = 'elementor-widget-container';
                
                // Get all verses
                const verses = Array.from(document.querySelectorAll('p')).filter(p => 
                  p.querySelector('.psalm-verse-number')
                );
                
                // Create a paragraph for all verses
                const versesParagraph = document.createElement('p');
                verses.forEach(verse => {
                  versesParagraph.appendChild(verse.cloneNode(true));
                });
                
                // Add the paragraph to the wrapper
                wrapperDiv.appendChild(versesParagraph);
                
                // Add the wrapper to the container
                container.appendChild(wrapperDiv);
                
                // Set the page title
                document.title = \`תהילים - פרק \${chapterNumber}\`;
                
                // Clear the body and add our container
                document.body.innerHTML = '';
                document.body.appendChild(container);
              ''');

              // Add a 1-second delay before hiding the loading overlay
              await Future.delayed(const Duration(seconds: 1));
              if (mounted) {
                setState(() {
                  _isLoading = false;
                });
              }
            }
          },
          onWebResourceError: (WebResourceError error) {
            if (mounted) {
              setState(() {
                _isLoading = false;
              });
            }
          },
        ),
      );

    // Load the PDF URL directly
    await controller.loadRequest(Uri.parse(pdf));
    _webViewController = controller;
    return controller;
  }
}
