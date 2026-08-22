import cv2
import numpy as np

def create_dummy_video():
    width, height = 640, 480
    fps = 10
    duration = 3  # seconds
    num_frames = duration * fps

    # Define the codec and create VideoWriter object
    # On Windows, 'mp4v' or 'MJPG' or 'XVID' are commonly supported
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter('test_video.mp4', fourcc, fps, (width, height))

    for i in range(num_frames):
        # Draw a blank frame with some moving text/shapes so it's not completely empty
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        # Put some text
        cv2.putText(frame, f"Frame {i}", (100, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        out.write(frame)

    out.release()
    print("test_video.mp4 created successfully.")

if __name__ == '__main__':
    create_dummy_video()
