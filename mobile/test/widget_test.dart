import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('App opens the authentication screen', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(child: CraftVisionApp()),
    );
    await tester.pump();

    expect(find.text('CraftVision 3D'), findsOneWidget);
    expect(find.text('Tiếp tục'), findsOneWidget);
  });
}
