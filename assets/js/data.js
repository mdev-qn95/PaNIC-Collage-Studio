'use strict';
/* ===== Danh mục, bảng màu, font, kích thước, nội dung mẫu ===== */
const CATS=[
  {id:'all',n:'Tất cả'},
  {id:'daily',n:'Hằng ngày',sub:'Photo dump · 4-cut · film · scrapbook',size:'fb',c:['#f4efe7','#2b2622','#c4703f']},
  {id:'wedding',n:'Cưới hỏi',sub:'Ảnh cổng · standee · save the date',size:'st80',c:['#fbf9f4','#1f1c18','#8c7355']},
  {id:'birthday',n:'Sinh nhật',sub:'Tạp chí · bóng bay · confetti',size:'fb',c:['#fff6ef','#3b1f2b','#e0577a']},
  {id:'event',n:'Sự kiện',sub:'Recap · vé mời · gala',size:'fb',c:['#151413','#f3ede3','#c8a86b']},
  {id:'travel',n:'Du lịch',sub:'Bưu thiếp · tem · hành trình',size:'p10',c:['#f3ece0','#23364a','#d0643c']},
  {id:'grad',n:'Tốt nghiệp',sub:'Class of · kỷ yếu',size:'fb',c:['#f2f1ec','#16233b','#b38b3f']},
];

const PALS={
  ivory:{n:'Ngà',bg:'#fbf9f4',text:'#1f1c18',accent:'#8c7355'},
  white:{n:'Trắng',bg:'#ffffff',text:'#151515',accent:'#6f6f6f'},
  linen:{n:'Vải lanh',bg:'#f4efe7',text:'#2b2622',accent:'#c4703f'},
  kraft:{n:'Giấy kraft',bg:'#e6d7bf',text:'#3a2a1c',accent:'#b4532a'},
  sage:{n:'Sage',bg:'#f1f3ec',text:'#2b3a29',accent:'#5e7352'},
  forest:{n:'Rêu',bg:'#f4f4ef',text:'#173a24',accent:'#2f6b3f'},
  blush:{n:'Hồng phấn',bg:'#fbf2ee',text:'#3a2826',accent:'#b07468'},
  party:{n:'Tiệc hồng',bg:'#fff6ef',text:'#3b1f2b',accent:'#e0577a'},
  butter:{n:'Bơ vàng',bg:'#fdf3d6',text:'#2e2a1f',accent:'#e0892b'},
  sky:{n:'Trời xanh',bg:'#eef3f7',text:'#1d3448',accent:'#3f7cac'},
  navy:{n:'Navy',bg:'#f2f1ec',text:'#16233b',accent:'#b38b3f'},
  lacquer:{n:'Đỏ son',bg:'#fbf5ef',text:'#5e1312',accent:'#a83a2c'},
  noir:{n:'Noir vàng',bg:'#151413',text:'#f3ede3',accent:'#c8a86b'},
  midnight:{n:'Đêm',bg:'#121a2b',text:'#eef1f7',accent:'#f2b84b'},
};

const FP={
  didone:{n:'Thanh mảnh',display:'Noto Serif Display',dw:300,serif:'Cormorant Garamond',script:'Great Vibes'},
  classic:{n:'Cổ điển',display:'Cormorant Garamond',dw:500,serif:'Cormorant Garamond',script:'Great Vibes'},
  lux:{n:'Sang trọng',display:'Playfair Display',dw:400,serif:'Playfair Display',script:'Dancing Script'},
  modern:{n:'Hiện đại',display:'Montserrat',dw:300,serif:'Lora',script:'Great Vibes'},
};

const SIZES={
  tt:{n:'Story · TikTok',sub:'1080 × 1920 · 9:16',w:1080,h:1920,u:'px',g:'Mạng xã hội'},
  fb:{n:'Bài đăng 4:5',sub:'1080 × 1350',w:1080,h:1350,u:'px',g:'Mạng xã hội'},
  sq:{n:'Vuông 1:1',sub:'1080 × 1080',w:1080,h:1080,u:'px',g:'Mạng xã hội'},
  wide:{n:'Ngang 16:9',sub:'1920 × 1080',w:1920,h:1080,u:'px',g:'Mạng xã hội'},
  p10:{n:'Ảnh in 10×15',sub:'10 × 15 cm',w:10,h:15,u:'cm',g:'In ảnh'},
  p10l:{n:'Ảnh in 15×10',sub:'15 × 10 cm · ngang',w:15,h:10,u:'cm',g:'In ảnh'},
  p13:{n:'Ảnh in 13×18',sub:'13 × 18 cm',w:13,h:18,u:'cm',g:'In ảnh'},
  p20:{n:'Ảnh in 20×30',sub:'20 × 30 cm',w:20,h:30,u:'cm',g:'In ảnh'},
  st80:{n:'Standee 80×180',sub:'80 × 180 cm',w:80,h:180,u:'cm',g:'In lớn · sự kiện'},
  st60:{n:'Standee 60×160',sub:'60 × 160 cm',w:60,h:160,u:'cm',g:'In lớn · sự kiện'},
  g60:{n:'Ảnh cổng 60×90',sub:'60 × 90 cm',w:60,h:90,u:'cm',g:'In lớn · sự kiện'},
  g50:{n:'Ảnh cổng 50×70',sub:'50 × 70 cm',w:50,h:70,u:'cm',g:'In lớn · sự kiện'},
  a3:{n:'A3 · A4',sub:'29.7 × 42 cm',w:29.7,h:42,u:'cm',g:'In lớn · sự kiện'},
  custom:{n:'Tuỳ chỉnh',sub:'nhập kích thước cm',w:60,h:90,u:'cm',g:'Tuỳ chỉnh'},
};

const FILTERS={
  none:{n:'Gốc'},film:{n:'Film'},warm:{n:'Nắng ấm'},cool:{n:'Se lạnh'},
  vivid:{n:'Rực rỡ'},fade:{n:'Mờ sương'},vintage:{n:'Hoài cổ'},bw:{n:'Đen trắng'},
};

/* Dữ liệu minh hoạ hư cấu theo dịp; nội dung người dùng sửa được lưu riêng cho từng dịp. */
const TEXTS={
  wedding:{n1:'Minh Khang',n2:'Thảo Vy',fn1:'Nguyễn Minh Khang',fn2:'Trần Thảo Vy',nick:'',date:'20 · 12 · 2026',head:'Welcome to our wedding',script:'Love story',tag:'Save the date',
    quote:'Từ khoảnh khắc tìm thấy nhau, chúng mình tin vào một tình yêu an hoà và bền vững — cùng nhau xây dựng một mái nhà trọn vẹn.',
    l1:'Groom',l2:'Bride',mono:'',big:'2026',sub:'Lễ thành hôn',place:'Địa điểm tổ chức',caps:''},
  birthday:{n1:'Bảo Anh',n2:'',fn1:'Nguyễn Bảo Anh',fn2:'',nick:'Bông',big:'1',head:'Happy Birthday',script:'Cheers to 1',date:'05 · 11 · 2026',sub:'Birthday Issue',
    quote:'Chúc Bảo Anh tuổi mới thật nhiều tiếng cười, yêu thương và những điều ngọt ngào!',tag:'#BaoAnhBirthday',place:'Không gian tiệc · 18:00',l1:'',l2:'',mono:'',caps:'Sở thích: khám phá,Món ngon: bánh ngọt,Tài lẻ: cười tít mắt'},
  event:{n1:'PaNIC Team',n2:'',head:'Year End Party',script:'Thank you',sub:'Gala 2026',date:'28 · 12 · 2026',place:'Hội An, Quảng Nam',
    tag:'#PaNICYEP2026',quote:'Một năm rực rỡ cùng nhau — cảm ơn từng người đã góp mặt.',big:'2026',l1:'',l2:'',mono:'',caps:''},
  daily:{n1:'Ngọc Hân',n2:'',head:'Photo dump',script:'little things',sub:'Tháng mười một',date:'05.11.2026',tag:'#chill',
    quote:'Những ngày bình thường cũng xứng đáng được nhớ.',place:'Sài Gòn',big:'2026',l1:'Then',l2:'Now',mono:'',
    caps:'Cà phê sáng,Đường quen,Hoàng hôn,Bữa tối,Góc nhỏ,Mây trời,Bạn thân,Về nhà,Ngủ ngon'},
  travel:{n1:'',n2:'',head:'Greetings from',place:'Đà Lạt',script:'Wanderlust',date:'Tháng 11 · 2026',sub:'3 ngày 2 đêm',
    quote:'Đi để thấy thế giới rộng lớn và lòng mình bình yên.',tag:'#dalat',big:'2026',l1:'',l2:'',mono:'',
    caps:'Hồ Xuân Hương,Đồi chè,Chợ đêm,Thung lũng,Cà phê,Rừng thông',from:'SGN',to:'DLI'},
  grad:{n1:'Nguyễn Minh Anh',n2:'',head:'Class of 2026',script:'Graduation',sub:'Đại học Kinh tế · K48',date:'25 · 06 · 2026',
    quote:'Hành trang mang theo là những người bạn và một thời thanh xuân rực rỡ.',tag:'#K48',big:'2026',place:'',l1:'',l2:'',mono:'',
    caps:'An,Bình,Chi,Dũng,Giang,Hà,Khoa,Linh,My,Nam,Oanh,Phúc'},
};

/* nhãn trường nhập theo dịp */
const LABELS={
  _:{n1:'Tên',n2:'Tên thứ hai',date:'Ngày',head:'Tiêu đề chính',script:'Chữ nghệ thuật',tag:'Dòng phụ / hashtag',quote:'Lời nhắn',
     l1:'Nhãn 1',l2:'Nhãn 2',mono:'Monogram (để trống = tự lấy chữ cái đầu)',big:'Số lớn',sub:'Dòng giới thiệu',place:'Địa điểm',caps:'Chú thích từng ảnh (cách nhau dấu phẩy)',from:'Mã nơi đi',to:'Mã nơi đến',fn1:'Họ tên đầy đủ',fn2:'Họ tên đầy đủ (2)',nick:'Biệt danh'},
  wedding:{n1:'Tên gọi chú rể',n2:'Tên gọi cô dâu',fn1:'Họ tên chú rể',fn2:'Họ tên cô dâu',l1:'Nhãn chú rể',l2:'Nhãn cô dâu',quote:'Lời yêu thương',tag:'Dòng phụ'},
  birthday:{n1:'Tên gọi',fn1:'Họ tên đầy đủ',big:'Số tuổi',sub:'Dòng nhỏ trên bìa',place:'Địa điểm · giờ',caps:'Thông tin (dạng Nhãn: nội dung, cách nhau dấu phẩy)'},
  event:{n1:'Đơn vị tổ chức',head:'Tên sự kiện',sub:'Dòng trên tiêu đề'},
  daily:{n1:'Tên của bạn',l1:'Nhãn ảnh trước',l2:'Nhãn ảnh sau',big:'Năm'},
  travel:{place:'Điểm đến',sub:'Mô tả chuyến đi',n1:'Tên hành khách'},
  grad:{n1:'Tên của bạn',sub:'Trường · khoá',caps:'Tên các bạn (cách nhau dấu phẩy)'},
};
