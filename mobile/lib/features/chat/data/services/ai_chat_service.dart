import '../../../../core/network/api_client.dart';

class AiChatService {
  const AiChatService(this._api);

  final ApiClient _api;

  Future<JsonMap> createSession({String? title}) async =>
      Map<String, dynamic>.from(
        await _api.post('/chat/sessions', body: {'title': title}),
      );

  Future<List<JsonMap>> getSessions() async =>
      (await _api.get('/chat/sessions') as List)
          .map((item) => Map<String, dynamic>.from(item as Map))
          .toList();

  Future<List<JsonMap>> getMessages(String sessionId) async =>
      (await _api.get('/chat/sessions/$sessionId/messages') as List)
          .map((item) => Map<String, dynamic>.from(item as Map))
          .toList();

  Future<JsonMap> sendMessage(String sessionId, String content) async =>
      Map<String, dynamic>.from(
        await _api.post(
          '/chat/sessions/$sessionId/messages',
          body: {'content': content},
        ),
      );
}
