import { Eye, EyeOff, HelpCircle } from 'lucide-react-native'
import React, { useState } from 'react'
import { Box } from '../ui/box'
import { Button, ButtonText } from '../ui/button'
import { HStack } from '../ui/hstack'
import { Input, InputField } from '../ui/input'
import { Pressable } from '../ui/pressable'
import { Text } from '../ui/text'
import { VStack } from '../ui/vstack'
import { MarkdownRenderer } from './MarkdownRenderer'

interface MarkdownEditorProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  label?: string
  multiline?: boolean
}

export function MarkdownEditor({
  value,
  onChangeText,
  placeholder = "Enter text with markdown formatting...",
  label,
  multiline = true,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const markdownHelp = `Headings

# h1 Heading 8-)
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading

Horizontal Rules

Some text above
___

Some text in the middle

---

Some text below

Emphasis

**This is bold text**

__This is bold text__

*This is italic text*

_This is italic text_

~~Strikethrough~~

Blockquotes

> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.

Lists

Unordered

+ Create a list by starting a line with \`+\`, \`-\`, or \`*\`
+ Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet. This is a very long list item that will surely wrap onto the next line.
    - Nulla volutpat aliquam velit
+ Very easy!

Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit. This is a very long list item that will surely wrap onto the next line.
3. Integer molestie lorem at massa

Start numbering with offset:

57. foo
58. bar

Code

Inline \`code\`

Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code

Block code "fences"

\`\`\`
Sample text here...
\`\`\`

Syntax highlighting

\`\`\` js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
\`\`\`

Tables

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Right aligned columns

| Option | Description |
| ------:| -----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Links

[link text](https://www.google.com)

[link with title](https://www.google.com "title text!")

Autoconverted link https://www.google.com (enable linkify to see)

Images

![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")

Like links, Images also have a footnote style syntax

![Alt text][id]

With a reference later in the document defining the URL location:

[id]: https://octodex.github.com/images/dojocat.jpg  "The Dojocat"

Typographic Replacements

Enable typographer option to see result.

(c) (C) (r) (R) (tm) (TM) (p) (P) +-

test.. test... test..... test?..... test!....

!!!!!! ???? ,,  -- ---

"Smartypants, double quotes" and 'single quotes'`

  return (
    <VStack className="space-y-3">
      {label && (
        <HStack className="justify-between items-center">
          <Text className="text-sm font-medium text-typography-900">{label}</Text>
          <HStack className="space-x-2">
            <Pressable
              onPress={() => setShowHelp(!showHelp)}
              className="p-1"
            >
              <HelpCircle
                size={16}
                color={showHelp ? "rgb(255, 105, 97)" : "rgb(163, 163, 163)"}
              />
            </Pressable>
            <Pressable
              onPress={() => setShowPreview(!showPreview)}
              className="p-1"
            >
              {showPreview ? (
                <EyeOff size={16} color="rgb(163, 163, 163)" />
              ) : (
                <Eye size={16} color="rgb(255, 105, 97)" />
              )}
            </Pressable>
          </HStack>
        </HStack>
      )}

      {showHelp && (
        <Box className="p-3 bg-tertiary-50 rounded-lg border border-tertiary-200">
          <Text className="text-xs font-mono text-tertiary-800">
            {markdownHelp}
          </Text>
        </Box>
      )}

      {showPreview ? (
        <Box className="h-[120px] p-4 bg-background-0 border border-outline-200 rounded-lg overflow-hidden">
          <MarkdownRenderer content={value || "Nothing to preview yet..."} />
        </Box>
      ) : (
        <Input
          variant="outline"
          size="md"
          isInvalid={false}
          isDisabled={false}
          isReadOnly={false}
          className="min-h-[120px]"
        >
          <InputField
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            multiline={multiline}
            numberOfLines={4}
            style={{
              minHeight: 120,
              maxHeight: 120,
              textAlignVertical: 'top',
              paddingTop: 12,
              paddingBottom: 12,
              paddingHorizontal: 16,
              lineHeight: 24,
            }}
            scrollEnabled={true}
          />
        </Input>
      )}

      <HStack className="justify-between items-center">
        <Text className="text-xs text-typography-500">
          Supports **bold**, *italic*, `code`, tables, links, and more
        </Text>
        <Button
          variant="outline"
          size="xs"
          onPress={() => setShowPreview(!showPreview)}
        >
          <ButtonText>
            {showPreview ? 'Edit' : 'Preview'}
          </ButtonText>
        </Button>
      </HStack>
    </VStack>
  )
}