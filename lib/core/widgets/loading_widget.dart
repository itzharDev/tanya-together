import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:tanya/core/cubit/loading_cubit.dart';
import 'package:tanya/core/ioc.dart';
import 'package:tanya/core/size_config.dart';

class LoadingScreen {
  static TransitionBuilder init({
    TransitionBuilder? builder,
  }) {
    return (BuildContext context, Widget? child) {
      if (builder != null) {
        return builder(context, LoadingCustom(child: child!));
      } else {
        return LoadingCustom(child: child!);
      }
    };
  }
}

class LoadingCustom extends StatelessWidget {
  final Widget child;
  const LoadingCustom({Key? key, required this.child}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Stack(
      children: [
        child,
        BlocBuilder<LoadingCubit, LoadingState>(
          bloc: locator.get(),
          builder: (context, state) {
            if (state is LoadingStateChanged && state.loading) {
              var children = <Widget>[
                const CircularProgressIndicator(),
              ];
              if (state.text != null && state.text!.isNotEmpty) {
                children.add(SizedBox(
                  height: SizeConfig.screenHeight * 0.04,
                ));
                children.add(
                  Text(
                    state.text!,
                    textAlign: TextAlign.right,
                    style: TextStyle(fontSize: SizeConfig.screenWidth * 0.05),
                  ),
                );
              }
              return Container(
                color: Colors.white70,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: children,
                  ),
                ),
              );
            } else {
              return Container();
            }
          },
        ),
      ],
    ));
  }
}
