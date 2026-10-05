export type FieldType = "text" | "textarea" | "date" | "number" | "color" | "image" | "images" | "audio" | "list" | "select";
export interface CardField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  max?: number;
  columns?: string[];
}
export interface CardTemplate {
  id: number;
  slug: string;
  title: string;
  category: string;
  model: string;
  action: string;
  reveal: string;
  fields: CardField[];
  color: string;
  background: string;
  message: string;
}
export const categories = ["Tình yêu", "Sinh nhật", "Tết & năm mới", "Gia đình", "Tri ân & thành tựu", "Thiếu nhi & Trung thu", "Giáng sinh & Halloween", "Ngày lễ & cộng đồng", "Dịp cá nhân"];
const palettes = [["#ef668f", "#17091d"], ["#f5ad59", "#18213c"], ["#f3bd55", "#300e19"], ["#de9970", "#162b29"], ["#c7a0fb", "#201a38"], ["#f7c76c", "#152549"], ["#f18374", "#102b35"], ["#8bd2ac", "#143129"], ["#91c6e8", "#182536"]];
const messages = ["Cảm ơn vì đã xuất hiện và làm những ngày bình thường trở nên đặc biệt. Mong chúng mình luôn dành cho nhau sự dịu dàng và chân thành.", "Chúc bạn một tuổi mới nhiều niềm vui, đủ tự tin để theo đuổi điều mình yêu và luôn có người thương bên cạnh.", "Chúc một năm mới bình an, nhiều sức khỏe và những khởi đầu tốt đẹp. Mong những điều nhỏ bé mỗi ngày đều mang đến niềm vui.", "Cảm ơn những yêu thương và sự đồng hành. Mong gia đình mình luôn khỏe mạnh, bình an và có thật nhiều khoảnh khắc bên nhau.", "Trân trọng những nỗ lực và điều tốt đẹp bạn đã mang đến. Chúc hành trình phía trước luôn rộng mở và đầy cảm hứng.", "Chúc bạn luôn giữ sự tò mò, nụ cười và những giấc mơ đẹp. Mong mỗi ngày đều có một điều mới để khám phá.", "Gửi bạn một chút bất ngờ và thật nhiều yêu thương. Chúc mùa lễ này ấm áp, vui vẻ và đầy những kỷ niệm đẹp.", "Gửi lời chúc bình an, niềm vui và sự gắn kết. Mong mỗi hành động tử tế đều góp thêm một điều tốt đẹp cho cuộc sống.", "Gửi bạn lời chúc chân thành và sự quan tâm. Mong chặng đường phía trước có nhiều niềm vui và những người luôn sẵn lòng đồng hành."];
const f = (key: string, label: string, type: FieldType = "text", required = false, extra: Partial<CardField> = {}): CardField => ({ key, label, type, required, ...extra });
const list = (key: string, label: string, max: number, columns = ["Nội dung"], required = false) => f(key, label, "list", required, { max, columns });
const choice = (key: string, label: string, options: string[]) => f(key, label, "select", false, { options });
const photo = f("photo", "Ảnh trong thư", "image");
const album = (max = 6) => f("album", "Album kỷ niệm", "images", false, { max });
const year = f("year", "Năm chúc mừng", "number", true);
const age = f("age", "Tuổi muốn hiển thị (bỏ trống để ẩn)", "number");
const date = f("eventDate", "Ngày đáng nhớ", "date");
const logo = f("logo", "Logo", "image");
const color = (label: string) => f("detailColor", label, "color");

type Definition = [string, string, string, string, string, CardField[]];
const definitions: Definition[] = [
  ["rose-love", "Hoa hồng dành cho em", "rose", "Chạm trái tim, kéo để xoay lời yêu", "Mưa chữ neon, trái tim và bó hồng rơi giữa không gian 3D", [color("Màu hoa"), f("ribbon", "Chữ trên nơ"), album(12)]],
  ["heart-key", "Chìa khóa trái tim", "lock", "Xoay chìa khóa mở trái tim", "Hai cánh trái tim mở ra lời tỏ tình", [f("confession", "Lời tỏ tình", "textarea", true), f("engraving", "Chữ khắc trên khóa"), f("keyLabel", "Chữ trên chìa"), date, photo]],
  ["memory-train", "Chuyến tàu đôi mình", "train", "Đưa tàu qua từng ga kỷ niệm", "Toa thư dừng lại ở ga cuối", [list("memories", "Các ga kỷ niệm (ít nhất 2)", 6, ["Tên ga", "Kỷ niệm", "Ngày", "Địa điểm"], true), f("trainName", "Tên chuyến tàu"), album(6)]],
  ["secret-ring", "Chiếc nhẫn bí mật", "ring", "Giữ để mở hộp nhẫn", "Nhẫn nâng lên trong vòng sáng", [f("proposal", "Lời cầu hôn", "textarea", true), f("couple", "Tên hai người"), date, f("engraving", "Chữ khắc trên nhẫn"), choice("metal", "Kim loại", ["Vàng", "Bạc", "Vàng hồng"]), choice("gem", "Màu đá", ["Trong suốt", "Hồng", "Xanh"]), photo]],
  ["distant-islands", "Hai bờ một bầu trời", "islands", "Thắp sáng hai ngôi nhà", "Cầu sao nối hai hòn đảo", [f("origin", "Nơi người gửi", "text", true), f("destination", "Nơi người nhận", "text", true), date, f("reunion", "Ngày hẹn gặp", "date"), f("distance", "Khoảng cách hoặc lời nhắn"), album(2)]],
  ["our-music", "Bản nhạc của chúng mình", "music", "Xoay núm hộp nhạc", "Đôi chim xoay và ngăn thư mở ra", [f("couple", "Tên hai người", "text", true), f("weddingDate", "Ngày cưới", "date", true), f("years", "Số năm kỷ niệm", "number"), f("song", "Tên bản nhạc kỷ niệm"), f("engraving", "Chữ khắc hộp nhạc"), album()]],
  ["birthday-wish", "Điều ước trên bánh kem", "cake", "Chạm lần lượt để tắt nến", "Ánh nến hóa sao, thư xuất hiện", [age, date, f("cakeText", "Chữ trên bánh"), choice("flavor", "Kiểu bánh", ["Dâu", "Chocolate", "Vani"]), f("wish", "Lời dẫn điều ước")]],
  ["birthday-balloon", "Chuyến bay tuổi mới", "balloon", "Kéo khinh khí cầu lên mây", "Mây tách ra, giỏ quà mang thư", [age, date, f("flight", "Tên chuyến bay"), list("wishes", "Những mong ước", 3), color("Màu khinh khí cầu"), photo]],
  ["birthday-space", "Sinh nhật ngoài vũ trụ", "rocket", "Giữ để phóng tên lửa", "Đến hành tinh tuổi mới", [age, f("planet", "Tên hành tinh"), f("astronaut", "Biệt danh phi hành gia"), f("mission", "Thông điệp nhiệm vụ"), color("Màu tên lửa")]],
  ["birthday-bear", "Gấu giao quà", "bear", "Mở từng lớp hộp quà", "Gấu gửi món quà cuối cùng", [f("bearName", "Tên gấu"), color("Màu gấu"), list("layers", "Lời nhắn cho từng lớp quà", 3), photo]],
  ["birthday-stage", "Bữa tiệc bất ngờ", "stage", "Kéo rèm sân khấu", "Đèn bật và bóng bay mang thư", [age, f("party", "Tên bữa tiệc"), list("wishes", "Lời chúc từ bạn bè", 8, ["Người chúc", "Lời chúc"]), color("Màu bóng bay")]],
  ["birthday-garden", "Khu vườn tuổi mới", "garden", "Giữ để tưới cây", "Hoa nở thành khu vườn lời chúc", [age, f("gardenName", "Tên khu vườn"), choice("flower", "Loại hoa", ["Hoa hồng", "Tulip", "Hoa cúc"]), color("Màu hoa"), list("wishes", "Lời chúc trên hoa", 5)]],
  ["tet-apricot", "Lộc xuân đầu năm", "apricot", "Chạm ba nụ mai", "Mai nở rộ, lì xì hạ xuống", [year, f("family", "Tên gia đình / công ty"), list("wishes", "Lời chúc lộc xuân", 5), f("potText", "Chữ trên chậu"), color("Màu lì xì")]],
  ["tet-peach", "Đào hồng đón Tết", "peach", "Chọn thẻ chúc trên cành đào", "Cánh đào mở khung tên", [year, list("tags", "Thẻ chúc", 6), f("coupletLeft", "Câu đối — vế trái"), f("coupletRight", "Câu đối — vế phải"), color("Màu đào"), f("family", "Tên gia đình")]],
  ["tet-reunion", "Tết đoàn viên", "table", "Bày các món lên bàn Tết", "Ngôi nhà sáng đèn sum họp", [f("family", "Tên gia đình", "text", true), list("members", "Thành viên", 8), photo, f("reunionWish", "Lời chúc sum vầy"), choice("food", "Món chính", ["Bánh chưng", "Bánh tét", "Mâm trái cây"])]],
  ["tet-lion", "Lân mang phúc tới", "lion", "Gõ trống ba nhịp", "Lân nhảy và cuộn chúc bung xuống", [year, f("organization", "Tên cá nhân / tổ chức"), f("scrollText", "Lời trên cuộn chúc"), color("Màu lân"), logo]],
  ["new-year-clock", "Khoảnh khắc giao thừa", "clock", "Xoay kim đồng hồ tới 12 giờ", "Thành phố bừng sáng pháo hoa", [year, list("wishes", "Mong ước năm mới", 3), f("midnight", "Câu chúc giao thừa"), color("Màu pháo hoa")]],
  ["new-voyage", "Chuyến hành trình mới", "sailboat", "Kéo buồm lên", "Thuyền ra khơi dưới bình minh", [f("journey", "Chủ đề hành trình", "text", true), year, f("boatName", "Tên thuyền"), f("destination", "Bến đến"), list("goals", "Mục tiêu", 3), f("sailText", "Chữ trên buồm")]],
  ["mothers-day", "Một ngày dành cho mẹ", "tea-flowers", "Cắm hoa vào giỏ", "Hơi trà tạo trái tim", [f("address", "Cách gọi mẹ"), album(2), list("gratitude", "Điều biết ơn", 3), color("Màu hoa"), f("cupText", "Chữ trên tách")]],
  ["fathers-day", "Người hùng của con", "medal", "Ghép huy hiệu tặng cha", "Huy hiệu đứng lên, ngăn thư mở", [f("address", "Cách gọi cha"), f("award", "Danh hiệu trên huy hiệu"), list("admiration", "Điều con ngưỡng mộ", 3), photo, date]],
  ["vu-lan", "Bông hồng biết ơn", "gratitude-rose", "Đặt hoa cạnh khung ảnh", "Ánh sáng tri ân lan nhẹ", [f("honoree", "Người được tri ân"), color("Màu hoa"), photo, f("memory", "Một kỷ niệm", "textarea"), choice("tone", "Sắc thái", ["Tri ân", "Tưởng nhớ"])]],
  ["family-home", "Ngôi nhà có chúng mình", "dollhouse", "Thắp sáng các phòng", "Mái nhà mở đón ảnh gia đình", [f("family", "Tên gia đình", "text", true), list("members", "Thành viên", 8, ["Tên", "Cách gọi"]), album(), f("motto", "Thông điệp mái ấm"), color("Màu nhà")]],
  ["family-tree", "Cây đời yêu thương", "family-tree", "Chạm những nhánh cây đời", "Cây phủ ánh vàng mừng thọ", [f("honorific", "Danh xưng", "text", true), f("age", "Tuổi mừng thọ", "number", true), date, photo, list("members", "Các nhánh con cháu", 12, ["Tên / nhóm", "Thế hệ"])]],
  ["welcome-baby", "Món quà bé xíu", "cradle", "Chạm vòng sao trên nôi", "Sao xoay và bảng tên hiện ra", [f("baby", "Tên / biệt danh em bé", "text", true), date, f("parents", "Tên cha mẹ"), photo, f("weight", "Cân nặng lúc sinh"), f("height", "Chiều dài lúc sinh"), color("Màu nôi")]],
  ["womens-day", "Tỏa sáng theo cách của bạn", "tulip", "Xoay pha lê hướng sáng vào hoa", "Tulip nở dưới chùm sáng", [f("quality", "Phẩm chất muốn tôn vinh"), list("wishes", "Lời chúc ngắn", 3), color("Màu tulip"), photo]],
  ["vietnamese-women", "Một nét dịu dàng Việt Nam", "conical-hat", "Xoay nón lá mở dải lụa", "Dải lụa ôm đóa sen", [f("ribbon", "Câu trên dải lụa"), color("Màu sen"), choice("pattern", "Họa tiết nón", ["Trơn", "Hoa", "Ngôi sao"]), photo, f("team", "Tập thể gửi tặng")]],
  ["teachers-chalk", "Nét phấn còn mãi", "chalkboard", "Viết lời cảm ơn trên bảng", "Nét phấn biến thành hoa", [f("teacher", "Cách gọi thầy / cô", "text", true), f("subject", "Môn học"), f("className", "Lớp"), f("school", "Trường"), f("schoolYear", "Niên khóa"), f("boardText", "Câu trên bảng"), photo, f("team", "Tập thể gửi")]],
  ["teachers-seed", "Người gieo hạt", "book-tree", "Đặt hạt vào trang sách", "Cây tri thức mọc lên", [f("teacher", "Cách gọi người được tri ân", "text", true), list("lessons", "Bài học đáng nhớ", 6), f("school", "Trường / lớp"), photo, f("quote", "Câu trích dẫn")]],
  ["graduation", "Bầu trời sau lễ tốt nghiệp", "graduation", "Tung mũ lên bầu trời", "Mũ bay qua vòng sao", [f("school", "Trường / chương trình", "text", true), f("major", "Ngành học"), f("degree", "Bậc học"), f("schoolYear", "Niên khóa"), date, photo, f("goal", "Mục tiêu tiếp theo"), color("Màu lễ phục")]],
  ["achievement", "Đỉnh cao tiếp theo", "mountain", "Chạm các mốc lên đỉnh", "Cờ mở và cúp nâng lên", [f("achievement", "Thành tích", "text", true), date, f("organization", "Tổ chức trao"), list("milestones", "Dấu mốc", 4), photo, f("goal", "Mục tiêu tiếp theo"), f("cupText", "Chữ trên cúp")]],
  ["candy-world", "Thế giới kẹo ngọt", "candy", "Chọn ba viên kẹo mở cổng", "Vòng quay lâu đài hoạt động", [f("nickname", "Biệt danh bé"), color("Màu kẹo"), f("castle", "Tên lâu đài"), list("wishes", "Lời chúc vui", 3), photo]],
  ["dinosaur-friend", "Khủng long làm bạn", "dinosaur", "Chạm nhẹ quả trứng", "Khủng long ló ra và chào bạn", [f("dinosaur", "Tên bạn khủng long"), color("Màu khủng long"), f("symbol", "Biểu tượng trên trứng"), f("hello", "Câu chào"), photo]],
  ["star-lantern", "Đèn sao đêm rằm", "star-lantern", "Thắp năm cánh sao", "Đèn sao nâng lên soi sáng", [year, color("Màu đèn"), f("handleText", "Tên trên cán đèn"), list("wishes", "Lời chúc trên sao", 5), photo]],
  ["moon-rabbit", "Thỏ ngọc giao thư", "rabbit", "Chạm mây dẫn thỏ ngọc", "Thỏ trao hộp bánh và thư", [f("rabbit", "Tên thỏ"), f("boxText", "Chữ trên hộp bánh"), year, photo, color("Màu hộp")]],
  ["lantern-street", "Phố đèn lồng", "lantern-street", "Thắp đèn dọc con phố", "Cả phố sáng, đèn sen mang thư", [f("street", "Tên phố / chủ đề", "text", true), list("lanterns", "Lời trên đèn", 6), color("Màu đèn"), year, photo]],
  ["back-to-school", "Trang vở đầu tiên", "schoolbag", "Sắp đồ vào cặp", "Sách mở thành ngôi trường", [f("schoolYear", "Năm học", "text", true), f("className", "Lớp / chương trình", "text", true), f("school", "Trường"), f("nickname", "Biệt danh học sinh"), list("goals", "Mục tiêu", 3), color("Màu cặp"), photo]],
  ["christmas-tree", "Ngôi sao trên cây thông", "christmas-tree", "Đặt sao lên ngọn cây", "Đèn sáng từ gốc tới ngọn", [year, color("Màu trang trí"), list("ornaments", "Chữ trên quả châu", 6), f("starText", "Chữ trên ngôi sao"), photo]],
  ["snow-globe", "Quả cầu tuyết nhiệm màu", "snow-globe", "Lắc quả cầu tuyết", "Tuyết lắng để lộ tên người nhận", [f("engraving", "Chữ trên bệ"), color("Màu nhà"), choice("snowman", "Người tuyết", ["Mũ đỏ", "Mũ xanh"]), photo, choice("snow", "Lượng tuyết", ["Nhẹ", "Vừa"])]],
  ["reindeer-mail", "Tuần lộc chuyển phát", "reindeer", "Kéo chuông gọi xe quà", "Tuần lộc kéo xe tới trước cửa", [f("nickname", "Tên trên kiện hàng"), f("reindeer", "Tên tuần lộc"), color("Màu xe"), f("tagText", "Chữ trên nhãn quà")]],
  ["christmas-fireplace", "Đêm bên lò sưởi", "fireplace", "Nhóm lửa và chọn tất quà", "Căn phòng ấm lên, thư trong tất", [list("stockings", "Tên trên tất", 6), photo, f("sign", "Câu trên bảng gỗ"), color("Màu tất")]],
  ["halloween-pumpkin", "Bí ngô tinh nghịch", "pumpkin", "Chạm đánh thức bí ngô", "Bí ngô bật sáng và mưa kẹo", [choice("face", "Nét mặt", ["Vui vẻ", "Tinh nghịch", "Ngạc nhiên"]), color("Màu mũ"), f("surprise", "Lời bất ngờ"), list("candies", "Lời trên kẹo", 3)]],
  ["friendly-ghost", "Căn nhà ma dễ thương", "ghost-house", "Gõ cửa ba lần", "Ma nhỏ mang bảng chào xuất hiện", [f("houseName", "Tên nhà"), f("ghost", "Tên bóng ma"), f("boo", "Câu trên bảng"), color("Màu nhà"), choice("surpriseMode", "Mức bất ngờ", ["Nhẹ", "Tắt"])]],
  ["national-day", "Sắc đỏ tự hào", "flag", "Kéo cờ lên cao", "Hoa sen nở dưới cờ", [year, f("organization", "Tên đơn vị / gia đình"), f("shortWish", "Lời chúc ngắn"), photo, logo]],
  ["peace-dove", "Bồ câu hòa bình", "dove", "Thả bồ câu bay", "Chim bay vòng quanh địa cầu", [year, f("peace", "Thông điệp hòa bình"), f("team", "Tên tập thể"), photo, f("ribbon", "Chữ trên dải băng")]],
  ["labor-day", "Những bàn tay xây dựng", "gears", "Ghép ba bánh răng", "Thành phố chuyển động", [f("team", "Cá nhân / tập thể tri ân", "text", true), f("industry", "Ngành nghề"), list("contributions", "Đóng góp", 3), logo, year, color("Màu thương hiệu")]],
  ["lotus-peace", "Sen sáng an lành", "lotus", "Mở từng lớp cánh sen", "Ánh sáng lan trên mặt nước", [f("honorific", "Danh xưng người nhận"), f("peace", "Câu chúc an lành"), color("Màu sen"), f("occasion", "Năm / tên dịp")]],
  ["earth-day", "Một mầm xanh cho Trái Đất", "earth", "Tưới mầm xanh", "Mảng xanh lan quanh địa cầu", [f("pledge", "Thông điệp / cam kết xanh", "textarea", true), f("campaign", "Tên chiến dịch"), list("actions", "Hành động xanh", 3), logo, f("team", "Tên nhóm"), date]],
  ["thanksgiving", "Bữa tối biết ơn", "harvest", "Đặt thẻ cảm ơn lên bàn", "Lá phong tạo vòng tròn ấm áp", [f("gratitude", "Điều biết ơn", "textarea", true), list("places", "Thẻ bàn", 6, ["Tên", "Câu cảm ơn"]), photo, year, color("Màu lá phong")]],
  ["new-home", "Chìa khóa tổ ấm", "house", "Mở cửa tổ ấm", "Ngôi nhà sáng đèn chào đón", [f("family", "Tên gia chủ / gia đình", "text", true), date, f("homeName", "Tên tổ ấm"), f("houseNumber", "Số nhà trang trí"), color("Màu nhà"), photo]],
  ["grand-opening", "Cánh buồm khai trương", "store", "Cắt dải ruy băng", "Cửa hàng mở và buồm vươn lên", [f("business", "Tên cửa hàng / doanh nghiệp", "text", true), f("industry", "Ngành kinh doanh"), date, logo, f("slogan", "Slogan"), color("Màu thương hiệu"), f("website", "Website (hiển thị dạng chữ)"), f("location", "Địa điểm")]],
  ["thank-you-tea", "Một tách cảm ơn", "teacup", "Rót một tách trà", "Hơi trà nâng lời cảm ơn", [f("gratitude", "Điều muốn cảm ơn", "textarea", true), date, photo, color("Màu tách"), f("cupText", "Chữ trên tách"), f("shortThanks", "Câu cảm ơn ngắn")]],
  ["sincere-apology", "Hàn gắn bằng chân thành", "mended-heart", "Ghép các mảnh trái tim", "Đường nối vàng ôm trái tim", [f("apology", "Điều muốn nhận lỗi", "textarea", true), f("change", "Điều sẽ sửa đổi", "textarea"), f("invitation", "Lời đề nghị trò chuyện"), photo, f("engraving", "Chữ trên trái tim")]],
  ["brighter-tomorrow", "Ngày mai trời lại sáng", "rainbow", "Gạt mây đón nắng", "Cầu vồng và hướng dương xuất hiện", [choice("context", "Ngữ cảnh", ["Động viên", "Chúc mau khỏe"]), f("encouragement", "Câu động viên"), f("memory", "Kỷ niệm tích cực", "textarea"), f("support", "Lời đề nghị hỗ trợ"), color("Màu hoa"), photo]],
  ["new-horizon", "Hẹn gặp ở chân trời mới", "suitcase", "Dán nhãn lên va-li", "Máy bay giấy đưa thư tới bạn", [choice("occasion", "Dịp đi xa", ["Chuyển nơi ở", "Du học", "Công việc", "Chia tay"]), f("destination", "Nơi đến"), date, list("labels", "Nhãn kỷ niệm", 3), album(), f("promise", "Lời hẹn gặp")]],
];
export const cardTemplates: CardTemplate[] = definitions.map(([slug, title, model, action, reveal, fields], index) => {
  const group = Math.floor(index / 6);
  const modelColors: Record<string, string> = { rose: "#dc315e", peach: "#ed82ad", lotus: "#f0a4bc", "conical-hat": "#f0a4bc", "tea-flowers": "#e58b9c", "snow-globe": "#91cce4", flag: "#e62528", dove: "#e3eaff" };
  return { id: index + 1, slug, title, model, action, reveal, fields, category: categories[group], color: modelColors[model] || palettes[group][0], background: palettes[group][1], message: messages[group] };
});
export const commonFields: CardField[] = [f("recipient", "Tên người nhận", "text", true), f("sender", "Tên / chữ ký người gửi", "text", true), f("title", "Tiêu đề thiệp"), f("intro", "Lời mở đầu"), f("letterTitle", "Tiêu đề lá thư"), f("message", "Lời chúc trong thư", "textarea", true), f("closing", "Dòng kết"), photo, f("audio", "Nhạc nền của bạn (không bắt buộc)", "audio"), f("accent", "Màu chủ đạo", "color"), f("envelopeColor", "Màu phong thư", "color"), f("envelopeLabel", "Chữ trên phong thư"), choice("seal", "Dấu niêm phong", ["Trái tim", "Ngôi sao", "Bông hoa"])];
export type CardValue = string | string[] | Record<string, string>[];
export interface CardDraft { version: 1; template: string; values: Record<string, CardValue>; }
export function fieldsFor(template: CardTemplate) { return [...commonFields, ...template.fields.filter(field => !commonFields.some(common => common.key === field.key))]; }
export function defaultDraft(template: CardTemplate): CardDraft {
  const values: Record<string, CardValue> = { recipient: "Người thương", sender: "Một người luôn bên bạn", title: template.title, intro: "Một món quà nhỏ, dành riêng cho bạn", letterTitle: "Gửi bạn thân mến", message: template.message, closing: "Với tất cả yêu thương", accent: template.color, envelopeColor: "#f9e8d4", envelopeLabel: "Dành riêng cho bạn", seal: "Trái tim" };
  for (const field of template.fields) {
    if (field.type === "list") values[field.key] = field.required ? Array.from({ length: field.key === "memories" ? 2 : 1 }, (_, i) => Object.fromEntries((field.columns || []).map((column, j) => [column, j === 0 ? `Kỷ niệm ${i + 1}` : "Một khoảnh khắc đáng nhớ"]))) : [];
    else if (field.type === "images") values[field.key] = [];
    else if (field.type === "select") values[field.key] = field.options![0];
    else if (field.type === "color") values[field.key] = template.color;
    else if (field.key === "year") values[field.key] = String(new Date().getFullYear());
    else if (field.required && !values[field.key]) values[field.key] = field.type === "date" ? "2026-01-01" : field.type === "number" ? "70" : field.label;
  }
  return { version: 1, template: template.slug, values };
}
export function validateDraft(template: CardTemplate, draft: CardDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fieldsFor(template)) {
    const value = draft.values[field.key];
    if (field.required && (!value || (typeof value === "string" && !value.trim()) || (Array.isArray(value) && value.length === 0))) errors[field.key] = "Vui lòng điền thông tin này.";
    if (typeof value === "string" && value && field.type === "number" && (!/^\d+$/.test(value) || Number(value) > (field.key === "year" ? 9999 : 150))) errors[field.key] = "Vui lòng nhập số nguyên hợp lệ.";
    if (field.key === "memories" && (!Array.isArray(value) || value.length < 2)) errors[field.key] = "Cần ít nhất hai ga kỷ niệm.";
    if (Array.isArray(value) && value.length > (field.max || 12)) errors[field.key] = `Tối đa ${field.max || 12} mục.`;
    if (field.type === "list" && Array.isArray(value) && value.some(row => typeof row !== "object" || !row[field.columns![0]]?.trim())) errors[field.key] = "Mỗi mục cần có tiêu đề hoặc nội dung đầu tiên.";
  }
  return errors;
}
