# Secure Watcher

 <img src="https://github.com/user-attachments/assets/464617bd-b9b3-4e9a-879e-c0f1bc8b1512" alt="logo">

Secure Watcher is a Node.js application that enhances security camera monitoring by processing captured images, applying watermarks and utilizing face recognition for intelligent notifications.

## Features

- **Real-time File Monitoring**  
  - Uses `chokidar` to detect new images captured by the security camera (Vstarcam CS66Q-X18).  

- **Automated Image Processing**  
  - Copies the image from the `camera` folder to a `store` folder for backup.  
  - Applies a watermark (logo) using the `sharp` package and saves it in the `water-mark` folder.  

- **Face Detection & Recognition**  
  - Uses `face-api.js` to check if a face is present in the image.  
  - If a face is detected, it extracts details such as **age, gender and emotions** and overlays them on the image.
 
     <img src="https://github.com/user-attachments/assets/eeefeaed-f5b5-4965-b8aa-ac63dcb00943" alt="face-detection-example">
    
- **Email Notifications**  
  - If no face is detected, sends the watermarked image via email using `nodemailer`.  
  - If a face is detected, the processed image (with age, gender, and emotions) is sent via email.

<img src="https://github.com/user-attachments/assets/78fd4de9-aa74-4af3-8078-fdda7c1efccd" alt="model">
<img src="https://github.com/user-attachments/assets/b85d5b76-b6f6-4f85-8a5c-203dcd79441d" alt="email">

## Technologies Used

- **Node.js** – Backend runtime  
- **Chokidar** – File watching  
- **Sharp** – Image processing & watermarking  
- **Face-api.js** – Face detection & recognition  
- **Nodemailer** – Email sending  

## How to Run the Project

1. **Clone the repository**  
   ```sh
   git clone https://github.com/MKarapiperakis/secure-watcher.git
   cd secure-watcher
   ```
2. **Install dependencies (Recommended Node.js version: 21.2.0)**
   ```sh
   npm install
   ```
3. **Set up environment variables**
   
    - Create a new .env file by copying the contents of .env.sample
    - Set the following environment variables accordingly:

```ini
EMAIL_SENDER='your-email@gmail.com'   # Gmail account for sending email notifications
PASSWORD_SENDER='your-app-password'   # Unique Gmail app password
NOTIFY_ADMIN='true'                  # Set to true to receive email notifications, false to only store images
EMAIL_RECEIVERS='receiver1@example.com,receiver2@example.com'  # Comma-separated list of BCC recipients
```
4. **Start the server**
  ```sh
   npm start
   ```
After starting the project, three folders will be created, each serving a unique purpose:

- camera:
This folder stores images captured by the camera. The Chokidar library monitors this directory for new files. Once a new image is detected, the image processing pipeline begins.
- store:
Processed images are moved here as a backup. Once the images are stored in this folder, they are deleted from the camera directory to free up space.
- water-mark:
This folder contains the final processed images. These images undergo compression (using the sharp package), watermarking and face recognition (using the face-api package) when applicable. The images in this folder are attached to the email notifications sent to recipients. After the email is sent, the images are deleted from this folder as well

<img src="https://github.com/user-attachments/assets/bb1a63ed-3d17-44e0-9f1a-acc3033c9a76" alt="folders-generation">

5. **Configure the security camera application**
   
- To configure the security camera application for the Vstarcam CS66Q-X18 (model used in this example), you can utilize the desktop application called **Eye4**. Open it and follow the steps outlined below:
    - Click the **gear icon** (settings) next to the camera you wish to configure. This will open the settings menu for that specific camera, allowing you to customize its options
![1](https://github.com/user-attachments/assets/230bc41a-45e5-4f21-a815-5c9c36df295f)
    - Enable the alarm by checking the box next to the alarm option and set a new Deployment Time
![2](https://github.com/user-attachments/assets/38f9ac51-63fe-40bd-91a6-e1cf2d94c6db)
    - Complete the configuration by selecting the days and hours for monitoring, enabling the trigger by checking the Motion Detection box, and choosing the desired action (e.g. capturing a Picture) from the available options
![3](https://github.com/user-attachments/assets/2122d639-30e2-4fc3-8d32-5c4615c10137)
    - As a final step, click on Options and choose the path where you want to save your images. Once the server is started, a folder named camera should be created automatically. Select this folder to ensure all captured images are stored in the designated location
![4](https://github.com/user-attachments/assets/9f209b1e-270f-4c5f-852c-c48f88e853c3)

- The Node.js app is compatible with all types of cameras. The key step is to run the project once initially and then configure your camera to save images directly into the camera directory.


---
This project is useful for home security, automated surveillance, and AI-powered alerts for unauthorized access.
