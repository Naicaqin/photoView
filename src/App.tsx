import { useEffect, useState } from 'react'
import './App.css'
import { PhotoSlider } from 'react-photo-view';
import 'react-photo-view/dist/index.css';

function App() {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);
  const images = [{
    images: 'https://mur-report-test-1255655535.file.myqcloud.com/748p-rRbQMfcLQbfYJOn3xPzk-y68NSyIvt8K0pRpjXhJEn12nRFpxRsKv1fFgNdFu7LcYoKnGnxYEQJPEBKIPcVnCAOxG1GSGTDIJY0LQvvv9mqHxEs8B4iAW_225Oqgsqg1Y3iwQCm07izzTVQTc_AgK2zdw-PRjyjSb_eBUWbyUzU-P_WhOh_qkYVe5ssqwTNUa-seKztFeXzzDeqcKmAq3QLUJvstOzr60obIjdDfjb92-JbFVUnevqiDUTi6OTwBNsjeYFN7SFgjniyPrrjguOv4iNy6c0Lm1so7D04qTHF5sx-Tw5Ea40rtpP7gTgm1m45N6gocAhlxwtR9hzWcS3DV5J6DuVYLNolYIqdLf8JVfBL8gaijjYpWjUEMv6jYiX5iPrtW-PP-FU9evbs7OwAJpQJpuPGC4XLSzg=?sign=4bcf5642d1fdc27ec136b4e8054534f0&t=67e3c57b&imageMogr2/auto-orient',
    id: 1001
  }, {
    images: 'https://mur-report-test-1255655535.file.myqcloud.com/748p-rRbQMfcLQbfYJOn330Xrxc_6qcYU6S9CFf1g6xIaRseq9gXnzG34UUlW3vpWR4t69c5GuJcMHYn1k3vP2uapsDN8Iyphx3CVYK4Xo7BATcKs5vruitLmbl4oHRbqlAflvcVu9yPmdGTPgqMOKVmsdBKxLqhUHtV215tHSCTC0dAwm1V9gYEzYnaBW6_5tdnTevLitvG6-mdQ57wm2wPG3qYV8W7qN6wsQAJDND7t7M_YXiJ2N3UUxkHcF0U8v5tGe-qP562bKPOHFJmJ7_1gf_UxLZIXBKJVKY_LiV-8H4T680kmgUF8307chLVeTP776RfQPEg-RcHwae3l2iQanYSKM-wjeqsMMwy5Qd4MqGIIzFBXnYRgB7Pmv4ZDZ6MeJoVzLa8IGxVrIvW5qmmtbHiaT176A_VtPfdJxU=?sign=36e15ca7945ee31949673856ad16a011&t=67e3c8ba&imageMogr2/auto-orient',
    id: 1002
  }];

  const handleImgClick = (item: string, index: number) => {
    previewImages[index] = item;
    setPreviewImages(previewImages);
    setPreviewIndex(index);
    setVisible(true);
  }

  const handlePreviewImageChange = async (index: number) => {
    if (!previewImages[index] && images) {
      previewImages[index] = images[index].images;
      setPreviewImages(previewImages);
    }
    setPreviewIndex(index);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasClickMask = (event: any) => {
    if (event.target) {
      const hide = event.target.classList?.value && event.target.classList?.value.includes('PhotoView__PhotoBox');
      // 目标元素不存className就要关闭图片预览（因为预览的图片被另外的容器包裹着，所以点击旁白并不能关闭）
      if (hide) {
        setVisible(false);
      }
    }
  };

   // 定义处理图片加载完成的函数
   const handleImageLoad = (img: HTMLImageElement) => {
    // 计算页面宽高比
    const widthRatio = (window.innerWidth - 248) / img.naturalWidth;
    const heightRatio = (window.innerHeight - 188) / img.naturalHeight;
    const scaleRatio = Math.min(widthRatio, heightRatio);
    const finalWidth = img.naturalWidth * scaleRatio;
    const finalHeight = img.naturalHeight * scaleRatio;
    // 大图缩小改宽高， 小图放大用缩放
    if (img.naturalWidth >= (window.innerWidth - 248) || img.naturalHeight >= (window.innerHeight - 188)) {
      console.log(img.naturalWidth >= (window.innerWidth - 248), img.naturalHeight >= (window.innerHeight - 188));
      img.width = finalWidth;
      img.height = finalHeight;
    } else {
      img.style.transform = img.style.transform.replace(
        /scale\([\d]+\)/g,
        `scale(${scaleRatio})`,
      );
    }
  };

  // 创建观察器实例(用于监听预览图片的变化)
  const observerPreviewImg = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // 遍历新增的节点
      mutation.addedNodes.forEach((node) => {
        // 确保是元素节点
        if (node instanceof HTMLElement) {
          if (node.matches('.PhotoView__Photo')) {
            // 因为默认打开可能会缩放，所以使用正则重置为1
            node.style.transform = node.style.transform.replace(
              /scale\([\d., ]+\)/g,
              `scale(${1})`,
            );
          }
        }

        if (node.nodeName === 'IMG' && node instanceof HTMLImageElement) {
          const img = node;
          // 如果图片已加载完成（比如从缓存中读取）
          if (img.complete) {
            handleImageLoad(img);
          } else {
            // 监听图片加载完成事件
            img.addEventListener('load', () => handleImageLoad(img));
          }
        }
      });
    });
  });

  useEffect(() => {
    if (visible) {
      // 开始观察整个文档的 DOM 变化
      observerPreviewImg.observe(document.body, {
        childList: true, // 监听子节点变化
        subtree: true, // 监听所有后代节点
      });
      document.body.addEventListener('click', hasClickMask);
    } else {
      document.body.removeEventListener('click', hasClickMask);
      observerPreviewImg.disconnect();
    }
  }, [visible])

  return (
    <div>
      <section className='section previewSection'>
      {images.map(((item, index) => (
            <img
              key={`${item.id}img`}
              className='previewImg'
              src={item.images}
              alt=""
              id={`preview-${index + 1}`}
              onClick={() => handleImgClick(item.images, index)}
            />
          )))}
          <PhotoSlider
            images={previewImages.map((item, index) => ({ src: item, key: item + index }))}
            visible={visible}
            onClose={() => {
              setVisible(false);
            }}
            index={previewIndex}
            onIndexChange={(index: number) => handlePreviewImageChange(index)}
            imageClassName='previewPhoto'
            maskClassName='mask'
            className='photoSliderStyle'
          />
      </section>
    </div>
  )
}

export default App
