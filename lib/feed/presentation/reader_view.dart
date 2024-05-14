import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';

import 'package:tanya/core/ioc.dart';
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
  @override
  void initState() {
    List<int> ex = [];

    if (widget.group.book != null && widget.group.book!.length > 0) {
      widget.group.book!.forEach((key, value) {
        if (key != "groupName" && key.isNotEmpty) {
          ex.add(int.parse(key));
        }
      });
    }

    if (widget.group.inProgress != null &&
        widget.group.inProgress!.length > 0) {
      widget.group.inProgress!.forEach((key, value) {
        if (key != "groupName" && key.isNotEmpty) {
          ex.add(int.parse(key));
        }
      });
    }

    part = locator
        .get<FeedCubit>()
        .getRandomWithExclusion(1, widget.group.max!, ex);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    String pdf = "https://s3.amazonaws.com/DvarMalchus/tanya/socialTanya/" +
        part.toString() +
        ".pdf";
    return Scaffold(
      appBar: AppBar(),
      body: Container(
        child: Container(
          color: Colors.red,
          child: SfPdfViewer.network(pdf),
        ),
      ),
    );
  }
}
