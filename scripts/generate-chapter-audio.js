const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

require('dotenv').config();

const MARKUP = {
  HEIGHT_PAUSE: '§HEIGHT_PAUSE§',
  HEADING_START: '§HEADING_',
  HEADING_END: '§END_HEADING§',
  QUOTE_START: '§QUOTE_START§',
  QUOTE_END: '§QUOTE_END§',
  EMPHASIS_START: '§EMPHASIS_START§',
  EMPHASIS_END: '§EMPHASIS_END§',
};

function validateArguments() {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    console.error(
      '[FAIL] Usage: node generate-chapter-audio.js <chapter-slug> <output-filename>'
    );
    console.error(
      'Example: node generate-chapter-audio.js chapterone chapterone.mp3'
    );
    console.error(
      'Debug mode: node generate-chapter-audio.js chapterone debug-chapterone.xml'
    );
    process.exit(1);
  }

  const [chapterSlug, outputFilename] = args;

  if (!chapterSlug) {
    console.error('[FAIL] Chapter slug is required');
    process.exit(1);
  }

  if (!outputFilename) {
    console.error('[FAIL] Output filename is required');
    process.exit(1);
  }

  const isDebugMode = outputFilename.endsWith('.xml');

  if (!isDebugMode && !outputFilename.endsWith('.mp3')) {
    console.error('[FAIL] Output filename must end with .mp3 or .xml');
    process.exit(1);
  }

  return { chapterSlug, outputFilename, isDebugMode };
}

function convertToCustomMarkup(markdownContent) {
  let content = markdownContent.replace(/^---[\s\S]*?---\s*/, '');

  const headingMatch = content.match(/^#{1,6}\s+.+$/m);
  if (headingMatch) {
    const headingIndex = content.indexOf(headingMatch[0]);
    content = content.substring(headingIndex);
  }

  content = content.replace(
    /<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">[\s\S]*?<\/div>\s*<\/div>/g,
    match => {
      const headingRegex = /<h4[^>]*>([^<]+)<\/h4>/g;
      const headings = [];
      let headingMatch;
      while ((headingMatch = headingRegex.exec(match)) !== null) {
        headings.push(headingMatch[1].trim());
      }

      const liRegex = /<li[^>]*>([^<]+)<\/li>/g;
      const listItems = [];
      let liMatch;
      while ((liMatch = liRegex.exec(match)) !== null) {
        listItems.push(liMatch[1].trim());
      }

      let formattedContent = '\n\n';

      headings.forEach((heading, index) => {
        formattedContent += `${heading}:\n`;

        const startIndex = index * 5;
        const endIndex = startIndex + 5;

        for (
          let i = startIndex;
          i < Math.min(endIndex, listItems.length);
          i++
        ) {
          if (listItems[i]) {
            formattedContent += `• ${listItems[i]}\n`;
          }
        }
        formattedContent += '\n';
      });

      return formattedContent;
    }
  );

  // Preserve PAUSE comments before removing HTML tags
  content = content.replace(/<!-- PAUSE -->/g, '§PAUSE§');
  content = content.replace(/<[^>]*>/g, '');
  // Keep §PAUSE§ as is - it will be converted to SSML later

  content = content.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  content = content.replace(/!\[([^\]]*)\]\([^)]*\)/g, '');

  content = content.replace(/\n\s*Source\s*\n/g, '\n');
  content = content.replace(/\s+Source\s*$/gm, '');

  content = content.replace(/_([^_]+)_/g, '§EMPHASIS_START§$1§EMPHASIS_END§');

  content = content.replace(
    /<div style="height:\s*(\d+)px;"><\/div>/g,
    MARKUP.HEIGHT_PAUSE
  );
  content = content.replace(
    /<div style="height:\s*(\d+)px;\s*"><\/div>/g,
    MARKUP.HEIGHT_PAUSE
  );

  content = content.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
    const level = hashes.length;
    return `${MARKUP.HEADING_START}${level}§${title}${MARKUP.HEADING_END}`;
  });

  content = content.replace(
    /"([^"]*)"/g,
    `${MARKUP.QUOTE_START}$1${MARKUP.QUOTE_END}`
  );

  content = content.replace(
    /\*\*(.*?)\*\*/g,
    `${MARKUP.EMPHASIS_START}$1${MARKUP.EMPHASIS_END}`
  );
  content = content.replace(
    /\*(.*?)\*/g,
    `${MARKUP.EMPHASIS_START}$1${MARKUP.EMPHASIS_END}`
  );

  return content;
}

function extractSectionsFromMarkup(content) {
  const sections = content
    .split(/\n(?=§HEADING_[12]§|(?=^#{1,2}\s))/g)
    .map(section => {
      section = section.replace(/<[^>]*>/g, '');

      section = section.replace(/§HEIGHTPAUSE§/g, '§HEIGHT_PAUSE§');
      section = section.replace(/§HEADING(\d+)§/g, '§HEADING_$1§');
      section = section.replace(/`/g, '');

      section = section.replace(/\n\s*\n/g, '\n\n');
      section = section.replace(/\s+/g, ' ');
      section = section.trim();

      return section;
    })
    .filter(Boolean);

  const finalSections = [];
  sections.forEach(section => {
    if (section.length > 2000) {
      const sentences = section.split(/(?<=[.!?])\s+/);
      let currentChunk = '';

      sentences.forEach(sentence => {
        if ((currentChunk + sentence).length > 1500) {
          if (currentChunk) {
            finalSections.push(currentChunk.trim());
          }
          currentChunk = sentence;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
      });

      if (currentChunk) {
        finalSections.push(currentChunk.trim());
      }
    } else {
      finalSections.push(section);
    }
  });

  return finalSections;
}

function convertMarkupToSSML(text, isFirstSection = false) {
  // Convert ampersands to "and" to avoid XML escaping issues
  text = text.replace(/&/g, ' and ');

  text = text.replace(/§HEIGHT_PAUSE§/g, '<break time="0.5s"/>');

  text = text.replace(
    /§HEADING_(\d+)§(.+?)§END_HEADING§/g,
    (match, level, title) => {
      const pauseTime =
        level === '1' ? '1.2s' : level === '2' ? '0.8s' : '0.4s';
      return `<break time="${pauseTime}"/>${title}<break time="0.6s"/>`;
    }
  );

  text = text.replace(/^(#{1,2})\s+(.+)$/gm, (match, hashes, title) => {
    const level = hashes.length;
    const pauseTime = level === 1 ? '1.2s' : '0.8s';
    return `<break time="${pauseTime}"/>${title}<break time="0.6s"/>`;
  });

  text = text.replace(
    /<emphasis level="moderate"><emphasis level="moderate">/g,
    '<emphasis level="moderate">'
  );
  text = text.replace(/<\/emphasis><\/emphasis>/g, '</emphasis>');

  text = text.replace(
    /<\/emphasis><break[^>]*><\/emphasis>/g,
    '<break time="0.5s"/>'
  );

  text = text.replace(
    /§EMPHASIS_START§([^§]+)§EMPHASIS_END§/g,
    '<emphasis level="moderate">$1</emphasis>'
  );

  text = text.replace(/([.!?])\s+([A-Z])/g, '$1<break time="0.3s"/> $2');
  text = text.replace(/([,;:])\s+([A-Z])/g, '$1<break time="0.15s"/> $2');
  text = text.replace(/(\n\s*)([A-Z][a-z]+\.)/g, '$1<break time="0.2s"/>$2');

  text = text.replace(
    /§QUOTE_START§(.+?)§QUOTE_END§/g,
    '<emphasis level="moderate">"$1"</emphasis><break time="0.5s"/>'
  );
  text = text.replace(
    /§EMPHASIS_START§(.+?)§EMPHASIS_END§/g,
    '<emphasis level="moderate">$1</emphasis>'
  );
  text = text.replace(
    /\*\*(.*?)\*\*/g,
    '<emphasis level="moderate">$1</emphasis>'
  );

  // Convert PAUSE markers to SSML breaks
  text = text.replace(/§PAUSE§/g, '<break time="0.8s"/>');

  text = convertNumbersToWords(text);

  text = text.replace(/<break[^>]*>\s*<break[^>]*>/g, '<break time="0.3s"/>');

  text = text.replace(
    /^- (.+)$/gm,
    '<break time="0.2s"/>• $1<break time="0.3s"/>'
  );

  text = text.replace(
    /^(\d+)\. (.+)$/gm,
    '<break time="0.2s"/>$1. $2<break time="0.3s"/>'
  );

  text = text.replace(
    /^- \*\*(.+)\*\*$/gm,
    '<break time="0.2s"/>• <emphasis level="moderate">$1</emphasis><break time="0.3s"/>'
  );

  return text;
}

function convertNumbersToWords(text) {
  text = text.replace(/(\d+),(\d+)/g, (match, thousands, hundreds) => {
    const total = parseInt(thousands + hundreds);
    if (total >= 1000 && total < 1000000) {
      return numberToWords(total);
    }
    return match;
  });

  text = text.replace(
    /\b(\d+)\b(?!\s*s|\.\d+s|px|%|#|\.\d+)/g,
    (match, num) => {
      const number = parseInt(num);
      if (number < 100) {
        return numberToWords(number);
      }
      return match;
    }
  );

  return text;
}

function numberToWords(num) {
  const ones = [
    '',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
  ];
  const teens = [
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ];
  const tens = [
    '',
    '',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
  ];

  if (num === 0) return 'zero';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one > 0 ? '-' + ones[one] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    if (hundred === 0) return numberToWords(remainder);
    if (remainder === 0) return ones[hundred] + ' hundred';
    return ones[hundred] + ' hundred ' + numberToWords(remainder);
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    if (thousand === 0) return numberToWords(remainder);
    if (remainder === 0) return numberToWords(thousand) + ' thousand';
    return numberToWords(thousand) + ' thousand ' + numberToWords(remainder);
  }
  return num.toString();
}

function generateSSML(text, isFirstSection = false) {
  const ssml = `<speak version='1.0' xml:lang='en-US'>
            <voice xml:lang='en-US' xml:gender='Male' name='en-US-AlloyTurboMultilingualNeural'>
                ${text}
            </voice>
        </speak>`;

  return ssml;
}

function generateMP3(
  text,
  outputFilename,
  isFirstSection = false,
  isDebugMode = false
) {
  const ssml = generateSSML(text, isFirstSection);

  if (isDebugMode) {
    fs.writeFileSync(
      outputFilename,
      ssml + '\n\n<!-- ===== SECTION SEPARATOR ===== -->\n\n',
      { flag: 'a' }
    );
    console.log(`[DEBUG] SSML written to: ${outputFilename}`);
    return true;
  }

  const tempFile = `temp_ssml_${Date.now()}.xml`;
  fs.writeFileSync(tempFile, ssml);

  try {
    const command = `curl -X POST "https://eastus.tts.speech.microsoft.com/cognitiveservices/v1" \
      -H "Ocp-Apim-Subscription-Key: ${process.env.AZURE_SPEECH_KEY}" \
      -H "Content-Type: application/ssml+xml" \
      -H "X-Microsoft-OutputFormat: audio-24khz-160kbitrate-mono-mp3" \
      -H "X-Microsoft-ContentFiltering: off" \
      -H "User-Agent: curl" \
      --data-binary @${tempFile} \
      --output ${outputFilename}`;

    execSync(command, { stdio: 'inherit' });

    fs.unlinkSync(tempFile);

    return true;
  } catch (error) {
    console.error('[ERROR] Failed to generate MP3:', error.message);
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    return false;
  }
}

function concatMP3s(mp3Files, outputFile) {
  const fileList = mp3Files.map(file => `file '${file}'`).join('\n');
  fs.writeFileSync('mp3list.txt', fileList);

  try {
    execSync(
      `ffmpeg -y -f concat -safe 0 -i mp3list.txt -c copy ${outputFile}`,
      { stdio: 'inherit' }
    );
    fs.unlinkSync('mp3list.txt');
    return true;
  } catch (error) {
    console.error('[ERROR] Failed to concatenate MP3s:', error.message);
    if (fs.existsSync('mp3list.txt')) {
      fs.unlinkSync('mp3list.txt');
    }
    return false;
  }
}

async function processMarkdownFile(
  inputFile,
  outputFilename,
  isDebugMode = false
) {
  try {
    console.log(
      `\n[${isDebugMode ? 'DEBUG' : 'AUDIO'}] Processing: ${inputFile}`
    );

    const markdownContent = fs.readFileSync(inputFile, 'utf8');

    const markupContent = convertToCustomMarkup(markdownContent);

    const sections = extractSectionsFromMarkup(markupContent);

    console.log(
      `[${isDebugMode ? 'DEBUG' : 'AUDIO'}] Found ${sections.length} sections`
    );

    if (isDebugMode) {
      fs.writeFileSync(outputFilename, '<!-- DEBUG SSML OUTPUT -->\n\n');

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const isFirstSection = i === 0;

        console.log(
          `[DEBUG] Generating section ${i + 1}/${sections.length}...`
        );

        const ssmlText = convertMarkupToSSML(section, isFirstSection);

        const success = generateMP3(
          ssmlText,
          outputFilename,
          isFirstSection,
          isDebugMode
        );

        if (!success) {
          throw new Error(`Failed to generate XML for section ${i + 1}`);
        }
      }

      console.log(`\n[SUCCESS] Debug XML generated: ${outputFilename}`);
      return true;
    } else {
      const mp3Files = [];

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const isFirstSection = i === 0;

        console.log(
          `[AUDIO] Generating section ${i + 1}/${sections.length}...`
        );

        const ssmlText = convertMarkupToSSML(section, isFirstSection);

        const tempMp3File = `temp_section_${i}.mp3`;
        const success = generateMP3(
          ssmlText,
          tempMp3File,
          isFirstSection,
          isDebugMode
        );

        if (success) {
          mp3Files.push(tempMp3File);
        } else {
          throw new Error(`Failed to generate MP3 for section ${i + 1}`);
        }
      }

      if (mp3Files.length === 1) {
        console.log(
          `\n[SINGLE] Single section detected, moving file directly...`
        );
        fs.renameSync(mp3Files[0], outputFilename);
        console.log(`\n[SUCCESS] Audio generated: ${outputFilename}`);
        return true;
      } else {
        console.log(`\n[CONCAT] Combining ${mp3Files.length} sections...`);
        const concatSuccess = concatMP3s(mp3Files, outputFilename);

        if (!concatSuccess) {
          throw new Error('Failed to concatenate MP3 files');
        }

        mp3Files.forEach(file => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
        });

        console.log(`\n[SUCCESS] Audio generated: ${outputFilename}`);
        return true;
      }
    }
  } catch (error) {
    console.error(`[FAIL] Error processing ${inputFile}:`, error.message);
    return false;
  }
}

async function main() {
  try {
    const { chapterSlug, outputFilename, isDebugMode } = validateArguments();

    const inputFile = `src/content/${chapterSlug}.md`;
    const outputFile = isDebugMode
      ? outputFilename
      : `public/vo/${outputFilename}`;

    if (!fs.existsSync(inputFile)) {
      console.error(`[FAIL] Input file not found: ${inputFile}`);
      process.exit(1);
    }

    if (!isDebugMode) {
      const outputDir = path.dirname(outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
    }

    const success = await processMarkdownFile(
      inputFile,
      outputFile,
      isDebugMode
    );

    if (!success) {
      console.error(
        `[FAIL] ${isDebugMode ? 'Debug XML' : 'Audio'} generation failed`
      );
      process.exit(1);
    }
  } catch (error) {
    console.error('[FAIL] Unexpected error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
