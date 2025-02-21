# Secure Watcher
![github-logo](https://github.com/user-attachments/assets/464617bd-b9b3-4e9a-879e-c0f1bc8b1512)

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

- **Email Notifications**  
  - If no face is detected, sends the watermarked image via email using `nodemailer`.  
  - If a face is detected, the processed image (with age, gender, and emotions) is sent via email.  

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
   
    i) Create a new .env file by copying the contents of .env.sample

    ii) Set the following environment variables accordingly:

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
5. To configure the security camera application for the Vstarcam CS66Q-X18 (model used in this example), you can utilize the desktop application called **Eye4**. Open it and follow the steps outlined below:

    i) Click the **gear icon** (settings) next to the camera you wish to configure. This will open the settings menu for that specific camera, allowing you to customize its options
![1](https://github.com/user-attachments/assets/230bc41a-45e5-4f21-a815-5c9c36df295f)

    ii) Enable the alarm by checking the box next to the alarm option, then set a new Deployment Time to specify when the alarm should be activated.
![2](https://github.com/user-attachments/assets/38f9ac51-63fe-40bd-91a6-e1cf2d94c6db)

    iii) Complete the configuration by selecting the days and hours for monitoring, enabling the trigger by checking the Motion Detection box, and choosing the desired action (e.g. capturing a Picture) from the available options
![3](https://github.com/user-attachments/assets/2122d639-30e2-4fc3-8d32-5c4615c10137)

    iv) As a final step, click on Options and choose the path where you want to save your images. Once the server is started, a folder named camera should be created automatically. Select this folder to ensure all captured images are stored in the designated location
![4](https://github.com/user-attachments/assets/9f209b1e-270f-4c5f-852c-c48f88e853c3)

The Node.js app is compatible with all types of cameras. The key step is to run the project once initially, and then configure your camera to save images directly into the camera directory.


---
This project is useful for home security, automated surveillance, and AI-powered alerts for unauthorized access.
