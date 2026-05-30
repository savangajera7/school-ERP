import os
from PIL import Image

def generate_silhouette(src_path, dest_path):
    try:
        img = Image.open(src_path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # item[3] is the alpha channel.
            # If the pixel is not fully transparent, make it pure white (255, 255, 255)
            # while keeping its original transparency level.
            if item[3] > 0:
                newData.append((255, 255, 255, item[3]))
            else:
                newData.append((0, 0, 0, 0))
                
        img.putdata(newData)
        # Resize to 96x96 or 72x72 which is standard for Android notification icons,
        # but keep high res so Expo can auto-scale it. 256x256 is perfect!
        img = img.resize((256, 256), Image.Resampling.LANCZOS)
        
        img.save(dest_path, "PNG")
        print(f"Successfully generated silhouette notification icon at {dest_path}")
        return True
    except Exception as e:
        print(f"Failed to generate silhouette from {src_path}: {e}")
        return False

# Try generating from school-logo.png first, fallback to icon.png
success = generate_silhouette("./assets/school-logo.png", "./assets/notification-icon.png")
if not success:
    generate_silhouette("./assets/icon.png", "./assets/notification-icon.png")
