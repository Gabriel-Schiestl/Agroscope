import Svg, { Circle, Path, type SvgProps } from 'react-native-svg';

/**
 * Íris — the AgroScope assistant's mark: a lens observing a leaf.
 * Mirrors the web version (packages/frontend/src/components/iris-icon.tsx)
 * pixel-for-pixel so the mascot looks identical on both platforms.
 */
export function IrisIcon({ color = '#000', size = 24, ...rest }: SvgProps & { size?: number }) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...rest}
        >
            <Circle cx="11" cy="11" r="8" />
            <Path d="M11 6.5c2.2 1.1 3.5 3 3.5 5.2A3.5 3.5 0 0 1 11 15a3.5 3.5 0 0 1-3.5-3.3c0-2.2 1.3-4.1 3.5-5.2Z" />
            <Path d="M11 8.7V15" />
            <Path d="m21 21-4.35-4.35" />
        </Svg>
    );
}
