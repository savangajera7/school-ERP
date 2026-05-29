from PIL import Image

def pad_image(path, target_size=1024, padding_ratio=0.66):
    try:
        img = Image.open(path).convert("RGBA")
        
        # Calculate new size based on padding ratio
        new_w = int(target_size * padding_ratio)
        new_h = int(target_size * padding_ratio)
        
        # Resize original image
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Create a new transparent image
        new_img = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
        
        # Paste the resized image into the center
        offset_x = (target_size - new_w) // 2
        offset_y = (target_size - new_h) // 2
        new_img.paste(img, (offset_x, offset_y), img)
        
        # Save back to the same path
        new_img.save(path, format="PNG")
        print(f"Successfully padded {path}")
    except Exception as e:
        print(f"Error processing {path}: {e}")

pad_image("./assets/adaptive-icon.png")
# We will only pad adaptive-icon.png because standard iOS icon.png should generally fill the square.
# Let's also create an ios icon just in case the standard one needs to be filled.
