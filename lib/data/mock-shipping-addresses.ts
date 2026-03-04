import { ShipperInfo, RecipientInfo } from "@/types/shipping-form"

// Mock saved shipper addresses
export const mockShippers: ShipperInfo[] = [
  {
    id: "shipper-1",
    name: "SnapLive Korea HQ",
    contactNumber: "+82 2 1234 5678",
    email: "warehouse@snaplive.kr",
    dispatchAddress:
      "123 Gangnam-daero, Gangnam-gu, Seoul, South Korea 06234",
  },
  {
    id: "shipper-2",
    name: "Seoul Distribution Center",
    contactNumber: "+82 2 9876 5432",
    email: "seoul.dc@snaplive.kr",
    dispatchAddress:
      "456 Teheran-ro, Gangnam-gu, Seoul, South Korea 06178",
  },
  {
    id: "shipper-3",
    name: "Busan Warehouse",
    contactNumber: "+82 51 2468 1357",
    email: "busan.wh@snaplive.kr",
    dispatchAddress:
      "789 Haeundae Beach-ro, Haeundae-gu, Busan, South Korea 48094",
  },
]

// Mock saved recipient addresses (examples from previous orders)
export const mockRecipients: RecipientInfo[] = [
  {
    id: "recipient-1",
    name: "Annie 安安",
    contactNumber: "+86 138 1234 5678",
    email: "jwang@redballvegcorp.cn",
    dispatchAddress:
      "Room 301, Building 5, Chaoyang District, Beijing, China 100020",
  },
  {
    id: "recipient-2",
    name: "The Product Curator 品管官",
    contactNumber: "+86 139 8765 4321",
    email: "curator@example.cn",
    dispatchAddress:
      "123 Main Street, Xuhui District, Shanghai, China 200030",
  },
  {
    id: "recipient-3",
    name: "Easy Pesl 易凯",
    contactNumber: "+86 135 5555 6666",
    email: "easypesl@example.cn",
    dispatchAddress:
      "456 Commerce Road, Tianhe District, Guangzhou, China 510630",
  },
  {
    id: "recipient-4",
    name: "Liu Wei 刘伟",
    contactNumber: "+86 186 1111 2222",
    email: "liuwei@example.cn",
    dispatchAddress:
      "Unit 808, Tower A, Nanshan District, Shenzhen, China 518000",
  },
  {
    id: "recipient-5",
    name: "Zhang Min 张敏",
    contactNumber: "+86 137 3333 4444",
    email: "zhangmin@example.cn",
    dispatchAddress:
      "Building 12, Floor 6, Wuhan Economic Development Zone, Wuhan, China 430056",
  },
]
