import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Icon generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
          borderRadius: '20%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* House shape */}
          <div
            style={{
              width: 18,
              height: 15,
              background: 'white',
              borderRadius: 2,
              position: 'relative',
              marginTop: 2,
            }}
          />
          {/* Roof */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderBottom: '10px solid white',
              position: 'absolute',
              top: 2,
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
