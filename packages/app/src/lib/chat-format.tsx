import { Fragment, ReactNode } from 'react';
import { Text } from 'react-native';

const BULLET = /^(\s*)[*-]\s+/;
const HEADING = /^\s*#{1,6}\s+/;
const INLINE = /(\*\*[^*\n]+\*\*|\*[^*\s][^*\n]*\*)/g;

export function normalizeChatLine(line: string): string {
    if (HEADING.test(line)) return line.replace(HEADING, '');
    return line.replace(BULLET, '$1• ');
}

function renderInline(line: string): ReactNode[] {
    return line
        .split(INLINE)
        .filter(Boolean)
        .map((part, index) => {
            if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
                return (
                    <Text key={index} style={{ fontWeight: '700' }}>
                        {part.slice(2, -2)}
                    </Text>
                );
            }
            if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
                return (
                    <Text key={index} style={{ fontStyle: 'italic' }}>
                        {part.slice(1, -1)}
                    </Text>
                );
            }
            return <Fragment key={index}>{part}</Fragment>;
        });
}

export function renderChatText(text: string): ReactNode {
    const lines = text.split('\n');
    return lines.map((line, index) => (
        <Fragment key={index}>
            {renderInline(normalizeChatLine(line))}
            {index < lines.length - 1 && '\n'}
        </Fragment>
    ));
}
