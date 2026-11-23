// 3D-style car driving left -> right on the yellow road of map_island_3d_yellow_roads.svg
// Overlay uses same viewBox as the map svg so coordinates match 1:1.
const ROAD_PATH =
  'M705,883 L745,882 L785,886 L825,880 L865,875 L905,875 L945,874 L985,868 L1025,859 L1065,854 L1105,852 L1145,852 L1185,851 L1225,848 L1265,848 L1305,850 L1345,856 L1385,865 L1425,879 L1465,888 L1505,893 L1545,900 L1585,905 L1625,909 L1665,911 L1695,914'

const DUR = '16s'

// Set VITE_CAR_ANIMATION=false in .env.local to park the car at the start of the road.
const ANIMATE = !['false', '0', 'off'].includes(String(import.meta.env.VITE_CAR_ANIMATION ?? 'true').trim().toLowerCase())
const START = 'translate(705,883) rotate(-1.4)'

export default function CarAnimation() {
  return (
    <svg
      className='map-car'
      viewBox='335 59 1795 1806'
      preserveAspectRatio='xMidYMid meet'
      aria-hidden='true'
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id='carBody' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#4d7cff' />
          <stop offset='0.55' stopColor='#1a47e0' />
          <stop offset='1' stopColor='#0b2a99' />
        </linearGradient>
        <linearGradient id='carRoof' x1='0' y1='0' x2='1' y2='0'>
          <stop offset='0' stopColor='#7fa3ff' />
          <stop offset='1' stopColor='#3a68f0' />
        </linearGradient>
        <linearGradient id='carGlass' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#e6f6ff' />
          <stop offset='1' stopColor='#7fb4d6' />
        </linearGradient>
      </defs>
      <g transform={ANIMATE ? undefined : START}>
        {ANIMATE && <animateMotion dur={DUR} repeatCount='indefinite' rotate='auto' path={ROAD_PATH} />}
        <g opacity={ANIMATE ? '0' : '1'}>
          {ANIMATE && <animate attributeName='opacity' values='0;1;1;0' keyTimes='0;0.05;0.95;1' dur={DUR} repeatCount='indefinite' />}
          <g transform='scale(2.875)'>
            {/* ground shadow */}
            <ellipse cx='1' cy='8' rx='24' ry='5' fill='#000' opacity='0.35' />
            {/* far-side wheels (depth) */}
            <circle cx='-12' cy='3' r='4' fill='#0b0b0b' />
            <circle cx='13' cy='3' r='4' fill='#0b0b0b' />
            {/* roof top face (3D) */}
            <path d='M-3,-14 L8,-14 L6,-17 L-1,-17 Z' fill='url(#carRoof)' />
            {/* body side */}
            <path d='M-21,5 L-21,-3 Q-21,-6 -17,-6 L-10,-7 L-6,-13 Q-5,-14 -3,-14 L8,-14 Q10,-14 11,-12 L14,-7 L19,-6 Q23,-5 23,-2 L23,5 Z' fill='url(#carBody)' />
            {/* lower shade strip */}
            <path d='M-21,1 L23,1 L23,5 L-21,5 Z' fill='#000' opacity='0.22' />
            {/* windows */}
            <path d='M-5,-7 L-2,-12 L2,-12 L2,-7 Z' fill='url(#carGlass)' />
            <path d='M4,-7 L4,-12 L8,-12 L11,-7 Z' fill='url(#carGlass)' />
            {/* highlight line */}
            <path d='M-18,-4 L20,-4' stroke='#fff' strokeOpacity='0.35' strokeWidth='0.8' />
            {/* headlight / taillight */}
            <rect x='21' y='-4' width='2.5' height='2.5' fill='#fff3b0' />
            <rect x='-21.5' y='-4' width='2' height='2.5' fill='#ff2a2a' />
            {/* near-side wheels */}
            <g>
              <circle cx='-12' cy='5' r='4.6' fill='#151515' />
              <circle cx='-12' cy='5' r='2' fill='#bbb' />
              <circle cx='14' cy='5' r='4.6' fill='#151515' />
              <circle cx='14' cy='5' r='2' fill='#bbb' />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
