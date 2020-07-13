import cv2
import os
import shutil
from api.config import NPF

if os.path.exists(NPF.COLORMAPS_PATH):
    shutil.rmtree(NPF.COLORMAPS_PATH, ignore_errors=True)
os.makedirs(NPF.COLORMAPS_PATH)

for file in os.listdir(NPF.HEIGHTMAPS_PATH):
    heightmap_path = os.path.join(NPF.HEIGHTMAPS_PATH, file)
    colormap_path = os.path.join(NPF.COLORMAPS_PATH, file)
    img = cv2.imread(heightmap_path, cv2.IMREAD_GRAYSCALE)
    cv2.normalize(img, img, 0, 255, norm_type=cv2.NORM_MINMAX)
    img = cv2.applyColorMap(img, cv2.COLORMAP_TURBO)
    cv2.imwrite(colormap_path, img)
