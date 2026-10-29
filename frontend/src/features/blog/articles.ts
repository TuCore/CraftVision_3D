import type { BlogArticle, BlogSummary } from "./types";

export const blogArticles: BlogArticle[] = [
  {
    slug: "qr-tinh-yeu",
    image: "/cards/previews/heart-key.webp",
    vi: {
      title: "QR tình yêu: một lần quét, mở ra lời nhắn riêng",
      description: "Kết nối món quà cầm trên tay với một tấm thiệp số chứa lời nhắn và kỷ niệm của bạn trên CraftVision 3D.",
      category: "Ý tưởng gửi yêu thương",
      imageAlt: "Trái tim hồng và chìa khóa vàng trong ảnh minh họa thiệp của CraftVision 3D",
      imageCaption: "Hình minh họa chủ đề trái tim và chìa khóa có sẵn trong hệ thống.",
      sections: [
        {
          id: "a-small-gateway",
          title: "Một mã nhỏ, một câu chuyện riêng",
          paragraphs: [
            "QR tình yêu là cách gọi một mã QR dẫn đến nội dung bạn dành cho người thương. Trên CraftVision 3D, mã chia sẻ mở đường dẫn của thiệp đã xuất bản, để người nhận đọc lời nhắn và trải nghiệm thiệp trong trình duyệt.",
            "Phần tạo nên ý nghĩa nằm ở nội dung phía sau: tên người nhận, một lời chúc đúng dịp, bức ảnh kỷ niệm hoặc lời tâm sự. Bạn có thể gửi đường dẫn trực tiếp khi người nhận đang xem quà trên cùng điện thoại.",
          ],
        },
        {
          id: "gift-and-card",
          title: "Đặt lời nhắn cạnh món quà handmade",
          paragraphs: [
            "Một tấm QR có thể đặt cạnh bó hoa, móc khóa hoặc món quà nhỏ. Cửa hàng CraftVision 3D là nơi bạn xem sản phẩm và thông tin hiện có; với sản phẩm hỗ trợ NFC, trang thiết kế đi kèm cho phép chuẩn bị nội dung thiệp theo luồng của sản phẩm đó.",
            "QR dùng thao tác quét bằng camera, còn NFC dùng thao tác chạm trên thiết bị hỗ trợ. Cả hai giúp người nhận đi từ món quà vật lý tới nội dung số, nhưng cách thiết lập phụ thuộc tính năng của sản phẩm bạn chọn.",
          ],
        },
        {
          id: "before-sharing",
          title: "Kiểm tra trước khi gửi",
          paragraphs: [
            "Với thiệp có link công khai, hãy mở thử link, đọc lại tên và lời nhắn rồi quét mã bằng một điện thoại khác. Mã cần được giữ rõ nét để người nhận dễ sử dụng.",
            "Link chia sẻ có thể được người khác chuyển tiếp. Hãy chọn ảnh và nội dung phù hợp để gửi qua đường dẫn, đồng thời kiểm tra trạng thái xuất bản của thiệp trước khi in mã lên quà.",
          ],
        },
      ],
    },
    en: {
      title: "Love QR: a small code that opens a personal message",
      description: "Connect a handmade gift with a digital greeting and memories on CraftVision 3D.",
      category: "Thoughtful gifting",
      imageAlt: "A pink heart and a golden key from CraftVision 3D card artwork",
      imageCaption: "Heart and key artwork available in the platform.",
      sections: [
        { id: "a-small-gateway", title: "A gateway to your message", paragraphs: ["A love QR is a QR code pointing to a greeting for someone special. For published cards on CraftVision 3D, it opens the card's shared link in a browser.", "The personal touch comes from the content: a name, a thoughtful wish or a memory. You can also send the link directly when the recipient is already using their phone."] },
        { id: "gift-and-card", title: "Pair it with a handmade gift", paragraphs: ["Place the code beside a flower arrangement or a small gift. Visit the shop for current products; eligible NFC products have their own greeting design flow.", "QR uses a camera scan, while NFC uses a tap on a supported device. Setup depends on the selected product and its available features."] },
        { id: "before-sharing", title: "Check before sharing", paragraphs: ["Open the published link, proofread the message and test the code on another phone before printing it.", "Shared links can be forwarded. Choose suitable photos and text, and make sure the card is published before attaching its code to a gift."] },
      ],
    },
  },
  {
    slug: "cach-tao-qr-tinh-yeu",
    image: "/images/memory-flower/card.png",
    imageFit: "contain",
    vi: {
      title: "Cách tạo QR tình yêu từ thiệp của bạn",
      description: "Đi từ nội dung thiệp đến link công khai và mã QR bằng các thao tác chia sẻ đã có trong CraftVision 3D.",
      category: "Hướng dẫn sử dụng",
      imageAlt: "Bó tulip trong phong bì từ bộ hình minh họa thiệp của hệ thống",
      imageCaption: "Phong bì hoa trong bộ hình minh họa thiệp kỷ niệm của CraftVision 3D.",
      sections: [
        {
          id: "prepare-your-card",
          title: "Bắt đầu từ thiệp bạn đang sở hữu",
          paragraphs: [
            "Đăng nhập và mở mục Thiệp của tôi để tiếp tục chỉnh sửa thiệp đã lưu. Chuẩn bị tên người nhận, lời nhắn và các nội dung mà trình chỉnh sửa của thiệp đó hỗ trợ; dùng phần xem thử để kiểm tra trước khi chia sẻ.",
            "Nếu bạn đang mua quà hỗ trợ NFC, hãy làm theo trang thiết kế thiệp đi kèm sản phẩm và luồng đặt hàng. Các bước dưới đây mô tả việc chia sẻ thiệp điện tử độc lập có khu vực Lưu & gửi thiệp.",
          ],
        },
        {
          id: "publish-and-download",
          title: "Xuất bản thiệp và lưu mã QR",
          paragraphs: ["Mã chia sẻ cần trỏ đến link công khai của thiệp; link xem thử trên thiết bị chưa thay thế cho bước xuất bản."],
          steps: [
            "Hoàn thiện nội dung, xem thử và lưu bản nháp trong trình chỉnh sửa.",
            "Với thiệp điện tử độc lập chưa thanh toán, chọn thanh toán qua PayOS và chờ hệ thống xác nhận. Mã thanh toán dùng để trả tiền, không phải mã gửi thiệp cho người nhận.",
            "Khi thiệp đủ điều kiện, chọn Xuất bản & tạo link. Nếu đã có bản công khai, dùng Cập nhật bản công khai sau khi chỉnh sửa.",
            "Trong phần Chia sẻ thiệp 3D, chọn Lưu mã QR hoặc sao chép link công khai để gửi trực tiếp.",
          ],
        },
        {
          id: "test-the-result",
          title: "Quét thử trước khi in hoặc gửi",
          paragraphs: [
            "Dùng điện thoại khác quét QR, mở thiệp và kiểm tra ảnh, lời nhắn cùng các tương tác. Giữ hình QR rõ nét khi đặt vào thiệp giấy hoặc hộp quà.",
            "Nếu đã thu hồi link, mã cũ sẽ không còn mở được bản công khai đó. Sau mỗi thay đổi liên quan đến việc chia sẻ, hãy kiểm tra lại đúng đường dẫn bạn định gửi.",
          ],
        },
      ],
    },
    en: {
      title: "How to create a love QR from your card",
      description: "Publish your greeting, get its shared link and save its QR code using CraftVision 3D's existing tools.",
      category: "Getting started",
      imageAlt: "An envelope holding tulips from the platform's card illustrations",
      imageCaption: "Flower envelope artwork from CraftVision 3D's memory card assets.",
      sections: [
        { id: "prepare-your-card", title: "Start with a card you own", paragraphs: ["Sign in and open My cards to continue a saved card. Add your message and use the preview to check the content supported by that editor.", "NFC gifts follow their product-specific design and checkout flow. The instructions below cover standalone digital cards with a Save & share section."] },
        { id: "publish-and-download", title: "Publish and save the QR", paragraphs: ["The sharing code must point to the published card rather than a local preview."], steps: ["Edit, preview and save your draft.", "For an unpaid standalone card, complete PayOS payment and wait for confirmation. The payment QR is different from the greeting's sharing QR.", "Choose Publish & create link, or update the existing public version after editing.", "In the sharing section, save the QR image or copy the public link."] },
        { id: "test-the-result", title: "Test before sending", paragraphs: ["Scan the code on another phone and check the message, images and interactions. Keep the QR clear when printing it.", "Revoking a link stops its old QR from opening that public card. Test the exact link you intend to send after changing sharing settings."] },
      ],
    },
  },
  {
    slug: "ma-qr-to-tinh",
    image: "/cards/previews/rose-love.webp",
    vi: {
      title: "Mã QR tỏ tình: để lời muốn nói có một nơi riêng",
      description: "Biến một lời nhắn thành món quà có câu chuyện, với thiệp số và những kỷ niệm do chính bạn lựa chọn.",
      category: "Câu chuyện món quà",
      imageAlt: "Hoa hồng và những lời yêu thương trong ảnh xem trước thiệp của CraftVision 3D",
      imageCaption: "Ảnh xem trước không gian hoa hồng và lời nhắn có sẵn trong hệ thống.",
      sections: [
        {
          id: "your-own-words",
          title: "Bắt đầu bằng một câu thật lòng",
          paragraphs: [
            "Thay vì cố viết một bức thư thật dài, bạn có thể bắt đầu bằng điều mình nhớ nhất: một lần được giúp đỡ, một cuộc trò chuyện hoặc một buổi đi chơi. Dùng chi tiết đó để viết lời mở đầu, rồi nói rõ điều bạn muốn gửi gắm.",
            "Chẳng hạn: “Mình vẫn nhớ buổi chiều hai đứa nói chuyện mãi không hết. Món quà nhỏ này là điều mình muốn dành cho bạn.” Đây là gợi ý câu chữ để bạn tự điều chỉnh, không phải lời nhắn được gửi tự động.",
          ],
        },
        {
          id: "make-it-personal",
          title: "Đưa kỷ niệm vào thiệp",
          paragraphs: [
            "Trong trình chỉnh sửa, điền tên người nhận và lời nhắn; thêm ảnh hoặc nội dung khác nếu thiệp đang dùng có hỗ trợ. Đọc lại bản xem thử như thể bạn là người nhận: câu chữ đã tự nhiên chưa, ảnh có đúng kỷ niệm muốn nhắc tới không?",
            "Bạn có thể ghép tấm thiệp với món quà handmade trong cửa hàng. Nếu cần ý tưởng hoặc muốn trao đổi cách tự làm một món quà, Vision Plus là khu vực trò chuyện AI đang có trên website.",
          ],
        },
        {
          id: "a-gentle-delivery",
          title: "Chọn cách gửi thật nhẹ nhàng",
          paragraphs: [
            "Khi thiệp đã xuất bản và có mã chia sẻ, đặt QR vào một tấm giấy nhỏ hoặc gửi link trực tiếp. Một câu như “Khi nào rảnh, bạn mở món quà nhỏ này nhé” có thể giúp người nhận chọn thời điểm phù hợp.",
            "Thiệp giúp bạn bày tỏ, còn cảm xúc và câu trả lời vẫn thuộc về người nhận. Hãy để món quà là lời chia sẻ chân thành, kèm sự tôn trọng dành cho họ.",
          ],
        },
      ],
    },
    en: {
      title: "A confession QR: a little space for what you want to say",
      description: "Give your message a story with a digital card and memories you choose yourself.",
      category: "Stories behind gifts",
      imageAlt: "A rose surrounded by affectionate messages in a CraftVision 3D preview",
      imageCaption: "Rose and message scene preview already available in the platform.",
      sections: [
        { id: "your-own-words", title: "Begin with something sincere", paragraphs: ["Start with a shared moment instead of a long speech: a conversation, a small kindness or a day together.", "For example: ‘I still remember that afternoon when we couldn't stop talking. This little gift is for you.’ Adapt it in your own voice; it is a writing suggestion, not an automatically sent message."] },
        { id: "make-it-personal", title: "Add your memories", paragraphs: ["Add the recipient's name and your message. Use photos or other fields where the selected editor supports them, then review the preview.", "Pair the greeting with a handmade shop gift. Vision Plus, the platform's AI chat area, can help you discuss gift ideas and DIY approaches."] },
        { id: "a-gentle-delivery", title: "Let them open it in their own time", paragraphs: ["Once published, place the sharing QR inside a small note or send the link directly with a gentle invitation to open it.", "A card lets you express yourself; the recipient's feelings and answer remain their own. Keep the gesture sincere and respectful."] },
      ],
    },
  },
  {
    slug: "trai-tim-qr-3d",
    image: "/cards/previews/heart-key.webp",
    vi: {
      title: "Trái tim QR 3D: từ mã quét đến trải nghiệm mở thiệp",
      description: "Khám phá cách biểu tượng trái tim, tương tác 3D và đường dẫn chia sẻ cùng kể một câu chuyện trong thiệp số.",
      category: "Trải nghiệm thiệp 3D",
      imageAlt: "Ổ khóa trái tim màu hồng với chìa khóa vàng trong bộ ảnh thiệp của hệ thống",
      imageCaption: "Minh họa chủ đề trái tim và chìa khóa của CraftVision 3D.",
      sections: [
        {
          id: "qr-and-3d",
          title: "QR là lối vào, thiệp là trải nghiệm",
          paragraphs: [
            "Cụm từ trái tim QR 3D mô tả việc mở một tấm thiệp mang chủ đề trái tim qua mã QR. Mã quét dẫn đến đường link; hình ảnh, chuyển động và tương tác diễn ra bên trong thiệp khi người nhận mở nó.",
            "Trong hệ thống có trải nghiệm trái tim và chìa khóa, cùng các không gian thiệp tương tác khác. Hình minh họa ở đầu bài thể hiện chủ đề này; mã chia sẻ thực tế được tạo ở khu vực chia sẻ của thiệp, không phải mã QR hình trái tim.",
          ],
        },
        {
          id: "a-reveal-with-meaning",
          title: "Một lần mở, một điều muốn kể",
          paragraphs: [
            "Biểu tượng chìa khóa có thể gợi cảm giác khám phá điều được giữ riêng cho người nhận. Bạn có thể nối hình ảnh đó với một lời mở đầu ngắn, rồi dẫn đến lời nhắn hoặc kỷ niệm trong nội dung mà thiệp hỗ trợ.",
            "Trước khi gửi, hãy xem thử thiệp đang sở hữu để biết chính xác thao tác của mẫu đó. Các thiệp có thiết kế và tương tác riêng, nên không phải mọi thiệp đều có cùng hiệu ứng mở khóa.",
          ],
        },
        {
          id: "share-the-experience",
          title: "Chia sẻ trải nghiệm, giữ nội dung rõ ràng",
          paragraphs: [
            "Thiệp có thể được mở từ link công khai hoặc QR chia sẻ sau khi xuất bản. Chọn lời nhắn đủ ngắn để dễ đọc trên điện thoại, rồi kiểm tra ảnh và thao tác trên bản xem thử.",
            "Nếu sử dụng một món quà hỗ trợ NFC, làm theo phần thiết kế thiệp của sản phẩm đó. QR và NFC là hai cách truy cập; các tính năng cụ thể vẫn phụ thuộc thiệp và sản phẩm bạn đang dùng.",
          ],
        },
      ],
    },
    en: {
      title: "3D heart QR: from a scan to an interactive greeting",
      description: "How a heart theme, 3D interaction and a shared link can tell a story together.",
      category: "Interactive greetings",
      imageAlt: "A pink heart-shaped lock and golden key from the platform's card artwork",
      imageCaption: "CraftVision 3D's heart and key illustration.",
      sections: [
        { id: "qr-and-3d", title: "The QR opens the door", paragraphs: ["A 3D heart QR means opening a heart-themed greeting through a QR code. The code points to a link; the visual experience happens inside the card.", "The platform includes a heart and key experience. This artwork illustrates that theme; the actual sharing code is generated in the card's sharing area, rather than as a heart-shaped QR."] },
        { id: "a-reveal-with-meaning", title: "A reveal with a personal meaning", paragraphs: ["Connect the heart theme with a short introduction and a memory using the content fields available in your card.", "Preview the card you own to check its exact interaction. Different cards have different designs, so an unlocking effect is not available in every greeting."] },
        { id: "share-the-experience", title: "Share a clear, readable greeting", paragraphs: ["After publishing, share the public link or QR and check the message and images on a phone.", "For eligible NFC gifts, use the product's own greeting design flow. QR and NFC are ways to access content; the available features depend on the card and product."] },
      ],
    },
  },
  {
    slug: "phao-hoa-tinh-yeu",
    image: "/cards/previews/birthday-wish.webp",
    vi: {
      title: "Pháo hoa tình yêu: thêm khoảnh khắc chúc mừng vào thiệp",
      description: "Dùng ánh sáng, chuyển động và một lời chúc đúng dịp để làm nổi bật khoảnh khắc mở món quà số.",
      category: "Cảm hứng ngày đặc biệt",
      imageAlt: "Bánh sinh nhật, nến và ánh sao trong ảnh minh họa thiệp chúc mừng của hệ thống",
      imageCaption: "Ảnh minh họa thiệp sinh nhật có sẵn, gợi không khí chúc mừng của bài viết.",
      sections: [
        {
          id: "a-moment-to-celebrate",
          title: "Đánh dấu một ngày đáng nhớ",
          paragraphs: [
            "Một ngày sinh nhật, dịp kỷ niệm hay lời chúc năm mới đều có thể bắt đầu bằng một tấm thiệp. Trong CraftVision 3D có các hiệu ứng hạt và pháo hoa dùng cho trải nghiệm chúc mừng; hiệu ứng hiển thị tùy thiết kế và ngữ cảnh của thiệp.",
            "Tên gọi pháo hoa tình yêu ở đây nói về khoảnh khắc bừng sáng trong thiệp số. Ảnh đầu bài là hình minh họa thiệp sinh nhật của hệ thống, không phải ảnh chụp một buổi trình diễn pháo hoa ngoài đời.",
          ],
        },
        {
          id: "write-for-the-occasion",
          title: "Để lời chúc dẫn dắt cảm xúc",
          paragraphs: [
            "Bạn có thể nhắc một kỷ niệm ngắn rồi kết bằng điều mong muốn cho người nhận: thêm một năm bình an, một hành trình mới hoặc nhiều buổi hẹn vui vẻ. Tên người nhận và một chi tiết riêng sẽ khiến câu chúc gần gũi hơn.",
            "Chỉ thêm ảnh và nội dung phù hợp với các trường trong trình chỉnh sửa. Xem thử thiệp để biết hiệu ứng có sẵn; bài viết không có nghĩa mọi thiệp đều có tùy chọn bật pháo hoa riêng.",
          ],
        },
        {
          id: "prepare-the-surprise",
          title: "Chuẩn bị một bất ngờ vừa đủ",
          paragraphs: [
            "Kết hợp thiệp với món quà handmade, hoặc gửi link công khai vào thời điểm bạn chọn. Nếu in QR, hãy xuất bản thiệp và quét thử trước khi đặt mã vào hộp quà.",
            "Khi người nhận mở thiệp, nội dung cá nhân vẫn là phần chính. Hiệu ứng ánh sáng và chuyển động chỉ giúp lời chúc có thêm một khoảnh khắc đáng nhớ.",
          ],
        },
      ],
    },
    en: {
      title: "Love fireworks: a little celebration inside your greeting",
      description: "Let light, movement and a thoughtful wish mark the moment a digital gift is opened.",
      category: "Special occasions",
      imageAlt: "A birthday cake, candles and stars from the platform's celebration card artwork",
      imageCaption: "Existing birthday artwork illustrating the article's celebration theme.",
      sections: [
        { id: "a-moment-to-celebrate", title: "Mark a memorable day", paragraphs: ["CraftVision 3D includes particle and firework effects for celebration experiences. Their appearance depends on the card's design and context.", "Love fireworks describes a bright moment in a digital greeting. The cover is existing birthday artwork, not a photograph of a real fireworks show."] },
        { id: "write-for-the-occasion", title: "Let the wish lead", paragraphs: ["Mention a shared memory and finish with a wish for the recipient. A name and a personal detail make it more meaningful.", "Use the fields available in your editor and preview the result. This article does not imply every card has a separate fireworks switch."] },
        { id: "prepare-the-surprise", title: "Prepare a small surprise", paragraphs: ["Pair the card with a handmade gift or send its public link at a time you choose. Publish and test the QR before printing it.", "Your personal message remains the centre of the experience; the lights and motion simply give it a memorable moment."] },
      ],
    },
  },
  {
    slug: "craftvision3d-la-gi",
    image: "/handmade-1.jpg",
    vi: {
      title: "CraftVision 3D là gì? Khi quà handmade có thêm một câu chuyện",
      description: "Tìm hiểu cửa hàng quà handmade, thiệp tương tác và Vision Plus trong cùng một hành trình chuẩn bị quà tặng.",
      category: "Về CraftVision 3D",
      imageAlt: "Những móc khóa cỏ bốn lá bằng hạt nhựa trong bộ ảnh handmade của CraftVision 3D",
      imageCaption: "Ảnh móc khóa handmade đang được sử dụng trong hệ thống.",
      sections: [
        {
          id: "handmade-gifts",
          title: "Bắt đầu từ một món quà cầm được trên tay",
          paragraphs: [
            "CraftVision 3D kết nối quà handmade với trải nghiệm thiệp số. Trong cửa hàng, bạn có thể tìm sản phẩm theo tên hoặc danh mục, xem ảnh, mô tả, giá và tình trạng hàng trước khi thêm vào giỏ.",
            "Ảnh đầu bài là những móc khóa cỏ bốn lá trong bộ ảnh handmade đang dùng trên website. Sản phẩm và giá bán thực tế cần được xem tại cửa hàng vì chúng có thể thay đổi theo thời điểm.",
          ],
        },
        {
          id: "a-digital-layer",
          title: "Thêm lời nhắn vào món quà",
          paragraphs: [
            "Với sản phẩm hỗ trợ NFC, luồng thiết kế thiệp đi kèm giúp bạn chuẩn bị nội dung cá nhân trước khi đặt hàng. Thiệp là nơi đặt tên người nhận, lời mở đầu, tâm thư và những nội dung mà trình chỉnh sửa hỗ trợ.",
            "Hệ thống cũng có thiệp điện tử lưu trên tài khoản, xem thử và chia sẻ sau khi đủ điều kiện xuất bản. Với thiệp đã có link công khai, bạn có thể gửi link hoặc mã QR để người nhận mở trên trình duyệt.",
          ],
        },
        {
          id: "vision-plus",
          title: "Vision Plus hỗ trợ tìm ý tưởng",
          paragraphs: [
            "Nếu chưa biết chọn món gì, bạn có thể đăng nhập và trò chuyện với Vision Plus. Khu vực này hỗ trợ trao đổi ý tưởng quà tặng, nguyên liệu, chi phí dự kiến và gợi ý liên quan đến yêu cầu của bạn.",
            "Bạn có thể bắt đầu bằng một câu cụ thể: “Mình muốn làm quà nhỏ bằng hạt nhựa ủi” hoặc “Mình cần ý tưởng hoa kẽm nhung”. Hãy kiểm tra thông tin sản phẩm trong cửa hàng và nguồn hướng dẫn trước khi mua hoặc thực hiện.",
          ],
        },
      ],
    },
    en: {
      title: "What is CraftVision 3D? Handmade gifts with a story",
      description: "Meet the handmade shop, interactive greetings and Vision Plus in one gifting journey.",
      category: "About CraftVision 3D",
      imageAlt: "Four-leaf clover bead keychains from CraftVision 3D's handmade image collection",
      imageCaption: "A handmade keychain photograph already used in the platform.",
      sections: [
        { id: "handmade-gifts", title: "Start with a handmade gift", paragraphs: ["CraftVision 3D connects handmade gifting with digital greetings. Search the shop by name or category and check photos, descriptions, prices and availability.", "The cover shows clover keychains from the website's handmade assets. Visit the shop for current products and prices."] },
        { id: "a-digital-layer", title: "Add a personal message", paragraphs: ["Eligible NFC products have a greeting design flow for personal content before checkout. Available fields depend on the editor.", "The platform also supports saved digital cards, previews and sharing once publication requirements are met. A published card can be opened using its public link or sharing QR."] },
        { id: "vision-plus", title: "Discuss ideas with Vision Plus", paragraphs: ["Sign in to Vision Plus to discuss gift ideas, materials and estimated costs based on your request.", "Try a specific prompt, such as a small fuse-bead gift or a pipe-cleaner flower idea. Check shop information and tutorial sources before buying or making anything."] },
      ],
    },
  },
];

export function findBlogArticle(slug: string) {
  return blogArticles.find((article) => article.slug === slug);
}

export function summarizeArticle(article: BlogArticle): BlogSummary {
  const { slug, image, imageFit, vi, en } = article;
  return {
    slug, image, imageFit,
    vi: { title: vi.title, description: vi.description, category: vi.category, imageAlt: vi.imageAlt },
    en: { title: en.title, description: en.description, category: en.category, imageAlt: en.imageAlt },
  };
}
