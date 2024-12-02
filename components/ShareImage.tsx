import React from "react";
import html2canvas from "html2canvas";

interface ShareImageProps {
  collectedItems: Array<{
    name: string;
    hakkaChinese: string;
    hakkaPhonetics: string;
    imageUrl?: string;
  }>;
  onClose: () => void;
}

const ShareImage: React.FC<ShareImageProps> = ({ collectedItems, onClose }) => {
  const generateImage = async () => {
    const element = document.getElementById("share-canvas");
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const image = canvas.toDataURL("image/png");

      if (navigator.share) {
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], "hakka-collection.png", {
          type: "image/png",
        });
        await navigator.share({
          title: "我的客語學習成果！",
          text: `我在教室主題中收集了 ${collectedItems.length} 個客語單字！`,
          files: [file],
        });
      } else {
        // 回退方案：下載圖片
        const link = document.createElement("a");
        link.download = "hakka-collection.png";
        link.href = image;
        link.click();
      }
    } catch (error) {
      console.error("生成/分享圖片失敗:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
        {/* 預覽區域 */}
        <div
          id="share-canvas"
          className="bg-gradient-to-r from-green-100 to-blue-100 p-8 rounded-lg"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              我的客語學習成果
            </h1>
            <p className="text-sm text-gray-600">
              收集了 {collectedItems.length} 個教室主題的客語單字！
            </p>
          </div>

          {/* 收集項目網格 */}
          <div className="grid grid-cols-1 gap-4">
            {" "}
            {/* 改為單列，確保每個項目換行 */}
            {collectedItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 shadow-md flex items-center"
              >
                {item.imageUrl && (
                  <div className="w-20 h-20 flex-shrink-0 mr-4">
                    {" "}
                    {/* 固定圖片大小 */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 whitespace-nowrap">
                  {" "}
                  {/* 防止文字換行 */}
                  <h3 className="font-bold text-xl">{item.name}</h3>
                  <p className="text-gray-600">{item.hakkaPhonetics}</p>
                  <p className="text-gray-600">{item.hakkaChinese}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              #客語學習 #數位學習 #教室主題
            </p>
          </div>
        </div>

        {/* 按鈕區域 */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={generateImage}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
          >
            下載圖片 分享成果！
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-2 rounded-full hover:bg-gray-600 transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareImage;
