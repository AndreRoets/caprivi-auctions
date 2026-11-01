import { SVGAttributes } from 'react';

/** The Caprivi Auctions mark (same artwork as public/favicon.svg). */
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg">
            <path fill="#e9e2d0" d="M147 18.5 A91 91 0 1 0 133 171 L130.5 148.5 A70 70 0 1 1 126.5 29.5 Z" />
            <g fill="#d3af35">
                <path d="M45 139 L86 45 Q88 42 92 42 L98 42 L118 64 L109 77 L97 62 L59 139 Z" />
                <path d="M58 129 L154 57" stroke="#d3af35" strokeWidth="13" />
                <path d="M127 93 L169 184" stroke="#d3af35" strokeWidth="15" />
                <g transform="translate(159 50) rotate(49)">
                    <rect x="-26" y="-11.5" width="6" height="23" rx="1.5" />
                    <rect x="-17.5" y="-11.5" width="35" height="23" />
                    <rect x="20" y="-11.5" width="6" height="23" rx="1.5" />
                </g>
            </g>
        </svg>
    );
}
