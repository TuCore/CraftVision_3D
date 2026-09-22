const mockProducts = [
  {
    name: "Charm hạt cơ bản",
    price: 35000,
    category: "Charm",
    image: "/image/charm.jpg",
    description: "Charm hạt nhựa cơ bản dễ thương, thích hợp để xỏ vòng tay hoặc vòng cổ tự làm.",
  },
  {
    name: "Charm đất sét nặn",
    price: 35000,
    category: "Charm",
    image: "/image/charmdatnang.jpg",
    description: "Charm làm từ đất sét tự nặn tỉ mỉ, độc đáo và đầy màu sắc.",
  },
  {
    name: "Charm nhựa trong suốt",
    price: 35000,
    category: "Charm",
    image: "/image/charmnhua.jpg",
    description: "Charm nhựa trong bắt sáng cực tốt, điểm nhấn lấp lánh cho món trang sức của bạn.",
  },
  {
    name: "Móc khóa nhựa dễ thương",
    price: 35000,
    category: "Móc khoá",
    image: "/image/mockhoa2.jpg",
    description: "Móc khóa nhựa in hình các nhân vật đáng yêu, món quà nhỏ mang nhiều ý nghĩa.",
  },
  {
    name: "Móc khóa len gấu",
    price: 65000,
    category: "Móc khoá",
    image: "/image/mockhoagau.jpg",
    description: "Móc khoá đan len thủ công hình gấu cực kỳ mềm mại, chi tiết sắc sảo.",
  },
  {
    name: "Móc khóa len hình thú",
    price: 65000,
    category: "Móc khoá",
    image: "/image/moclen.jpg",
    description: "Móc khoá len hình thú đa dạng, cực kỳ ngộ nghĩnh dùng để treo cặp balo.",
  },
  {
    name: "Dây chuyền đính charm",
    price: 120000,
    category: "Dây chuyền",
    image: "/image/vongco.jpg",
    description: "Dây chuyền thanh lịch với các charm nhỏ nhắn, tôn lên vẻ nữ tính dịu dàng.",
  },
  {
    name: "Vòng tay chuỗi hạt",
    price: 100000,
    category: "Vòng tay",
    image: "/image/vongtay.jpg",
    description: "Vòng tay chuỗi hạt màu pastel thủ công, phối màu cực kỳ dễ phối đồ.",
  },
  {
    name: "Vòng tay chuỗi hạt màu sắc",
    price: 100000,
    category: "Vòng tay",
    image: "/image/vongtay3.jpg",
    description: "Vòng tay xỏ hạt kết hợp nhiều kiểu dáng lạ mắt, mang lại cá tính riêng.",
  },
  {
    name: "Vòng tay hạt dễ thương",
    price: 100000,
    category: "Vòng tay",
    image: "/image/vongtaydethuong.jpg",
    description: "Vòng tay được làm từ các loại hạt cườm ngộ nghĩnh, phù hợp với phong cách kẹo ngọt.",
  },
  {
    name: "Vòng tay kim loại cá tính",
    price: 150000,
    category: "Vòng tay",
    image: "/image/vongtaysat.jpg",
    description: "Vòng tay kim loại phong cách năng động, không gỉ sét, phù hợp nam nữ.",
  }
];

async function seed() {
  console.log("Starting to seed products...");
  
  for (const product of mockProducts) {
    const payload = {
      productCategoryId: "11111111-1111-1111-1111-111111111004", // Default category
      name: product.name,
      description: product.description,
      price: product.price,
      stock: 100,
      productType: "InStock",
      supportsNfc: true,
      sampleImageUrl: product.image
    };

    try {
      const res = await fetch("http://localhost:5192/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        console.log(`✅ Success: ${product.name}`);
      } else {
        const errorText = await res.text();
        console.log(`❌ Failed: ${product.name} - ${errorText}`);
      }
    } catch (e) {
      console.log(`❌ Error connecting to API for ${product.name}: ${e.message}`);
    }
  }
  console.log("Seeding complete!");
}

seed();
