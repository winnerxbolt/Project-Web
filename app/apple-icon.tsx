import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Apple Touch Icon generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
          flexDirection: 'column',
        }}
      >
        {/* Sun */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 30,
            width: 25,
            height: 25,
            background: '#FFA500',
            borderRadius: '50%',
          }}
        />

        {/* House */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 30,
          }}
        >
          {/* Roof */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '40px solid transparent',
              borderRight: '40px solid transparent',
              borderBottom: '35px solid #0066CC',
            }}
          />
          {/* House body */}
          <div
            style={{
              width: 70,
              height: 50,
              background: '#0066CC',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            {/* Door */}
            <div
              style={{
                width: 20,
                height: 25,
                background: '#0052A3',
                borderRadius: '10px 10px 0 0',
              }}
            />
          </div>
        </div>

        {/* Wave */}
        <div
          style={{
            position: 'absolute',
            bottom: 15,
            left: 0,
            right: 0,
            height: 30,
            background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #DC143C 100%)',
            borderRadius: '50% 50% 0 0',
          }}
        />

        {/* Text */}
        <div
          style={{
            position: 'absolute',
            bottom: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: 20,
            fontWeight: 'bold',
          }}
        >
          <span style={{ color: '#0066CC' }}>POOL VILLA</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
