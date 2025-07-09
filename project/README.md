# AI Image Inpainting Web App

A beautiful, production-ready web application for AI-powered image inpainting using Stability AI's API. Upload an image, draw a mask over areas you want to modify, and let AI transform them based on your text prompt.

## Features

- **Image Upload**: Drag-and-drop or click to upload JPEG/PNG images
- **Interactive Canvas**: Draw precise masks with adjustable brush size
- **AI Inpainting**: Powered by Stability AI's advanced inpainting model
- **Real-time Preview**: See your mask as you draw
- **Download Results**: Save your generated images
- **Responsive Design**: Works perfectly on desktop and mobile
- **Error Handling**: Comprehensive error handling and user feedback

## Tech Stack

- **Framework**: Next.js 13+ (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Canvas**: HTML5 Canvas for mask drawing
- **API**: Stability AI Image-to-Image Inpainting API
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd image-inpainting-app
npm install
```

### 2. Environment Variables

1. Copy the environment example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Get your Stability AI API key:
   - Go to [Stability AI Platform](https://platform.stability.ai/account/keys)
   - Create an account or sign in
   - Generate an API key

3. Add your API key to `.env.local`:
   ```env
   NEXT_PUBLIC_STABILITY_API_KEY=your_actual_api_key_here
   ```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### 4. Build for Production

```bash
npm run build
npm start
```

## Usage

1. **Upload an Image**: Click the upload area or drag and drop a JPEG/PNG image
2. **Draw a Mask**: Use the canvas to paint over areas you want to modify
3. **Adjust Brush Size**: Use the slider to change the brush size for precise masking
4. **Enter a Prompt**: Describe what you want to generate in the masked area
5. **Generate**: Click the "Generate" button to create your inpainted image
6. **Download**: Save your result using the download button

## API Information

This app uses the Stability AI Image-to-Image Inpainting API v2beta. The API:
- Accepts PNG/JPEG images up to 4MP
- Supports various output formats
- Provides high-quality inpainting results
- Requires a valid API key with sufficient credits

## Project Structure

```
├── app/
│   ├── page.tsx           # Main inpainting interface
│   ├── layout.tsx         # App layout
│   └── globals.css        # Global styles
├── components/
│   ├── Canvas.tsx         # Drawing canvas component
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── stability.ts       # Stability API helper
│   └── utils.ts          # Utility functions
├── .env.local.example     # Environment variables example
└── README.md             # This file
```

## Features in Detail

### Canvas Drawing
- Smooth brush strokes with adjustable size
- Touch support for mobile devices
- Real-time mask preview with blend modes
- Clear mask functionality

### Error Handling
- API key validation
- File type validation
- Network error handling
- User-friendly error messages

### Performance
- Efficient canvas rendering
- Optimized image handling
- Responsive design patterns
- Loading states for better UX

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions:
1. Check the [Stability AI Documentation](https://platform.stability.ai/docs)
2. Review the error messages in the browser console
3. Ensure your API key is valid and has sufficient credits
4. Check your network connection

## Credits

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Powered by [Stability AI](https://stability.ai/)