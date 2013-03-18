#!/usr/bin/env node

var fs = require('fs');
var cli = require('commander');
var path = require('path');
var glob = require('glob').sync;
var marked = require('marked');

function writ(file, outputDir) {
  var mdfile = read(file);
  var source = compile(mdfile.src, mdfile.lang);
  fs.writeFileSync(out(file, outputDir), source);
}

function read(file) {
  var parts = file.split('.');

  return {
    src: fs.readFileSync(file, 'utf8'),
    lang: parts[parts.length - 2]
  };
}

function out(file, outputDir) {
  var outname = path.basename(file).replace(/\.md$|\.markdown$/, '');
  var outpath = outputDir || path.dirname(file);
  return path.join(outpath, outname);
}

function compile(src, lang) {
  var source = new Source(lang);
  codeblocks(src).forEach(function(block) {
    source.push(block);
  });
  return source.assemble();
}

function codeblocks(src) {
  return marked.lexer(src)
    .filter(function(block) { return block.type === 'code'; })
    .map(function(block) { return block.text; });
}

function Source(lang) {
  this.compileRE(lang);
  this.code = [];
  this.sections = {};
}

Source.prototype.re = {
  section: /^(?:com(==|!!)) *(.*?)(?: *\1com *)?\n\n?([\s\S]*)$/.source,
  ref: /^( *)com:: *(.*?)(?: *::com)? *$/.source,
};

Source.prototype.compileRE = function(lang) {
  var comment = quoteRE(commentSymbol(lang) || '//');

  this.re = {
    section: new RegExp(this.re.section.replace(/com/g, comment)),
    ref: new RegExp(this.re.ref.replace(/com/g, comment), 'mg'),
  };
};

Source.prototype.push = function(block) {
  var match = block.match(this.re.section);

  if (!match) {
    this.code.push(block + '\n');
    return;
  }

  if (match[1] === '!!') return;

  this.section(match[2]).push(match[3]);
};

Source.prototype.section = function(name) {
  return this.sections[name] || (this.sections[name] = [])
};

Source.prototype.assemble = function() {
  var code = this.code.join('\n');
  var depth = 0;
  var tmp;

  while(depth < 50) {
    tmp = this.resolveReferences(code);
    if (code === tmp) break;
    code = tmp;
    depth++;
  }

  if (depth === 50) error('Recursion limit exceeded');
  return code;
};

Source.prototype.resolveReferences = function(code) {
  var sections = this.sections;
  return code.replace(this.re.ref, function(match, leading, name) {
    return sections[name]
      ? indent(sections[name].join('\n'), leading)
      : match;
  });
}

cli.usage('[options] <glob ...>')
   .option('-d, --dir <path>', 'change output directory')
   .parse(process.argv);

if (!cli.args.length)
  cli.help();

var glob = require('glob').sync;

var inputs = cli.args.reduce(function(out, fileglob) {
  return out.concat(glob(fileglob));
}, []);

if (!inputs.length)
  error("Globs didn't match any source files");

if (cli.dir && !fs.existsSync(cli.dir))
  error('Directory does not exist: ' + JSON.stringify(cli.dir));

var outputDir = cli.dir;

inputs.forEach(function(file) {
  writ(file, outputDir);
});

function quoteRE(str) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
function commentSymbol(lang) {
  var slash = ['js', 'c', 'h', 'cpp', 'cs', 'php', 'm', 'java', 'scala'];
  var pound = ['coffee', 'litcoffee', 'ls', 'rb', 'py'];
  var dash = ['hs', 'lua'];
  var percent = ['erl', 'hrl'];

  if (slash.indexOf(lang) >= 0) return '//';
  if (pound.indexOf(lang) >= 0) return '#';
  if (dash.indexOf(lang) >= 0) return '--';
  if (percent.indexOf(lang) >= 0) return '%';
}

function indent(text, leading) {
  return text.replace(/^.*$/mg, leading + '$&');
}

function error(msg) {
  console.error(msg);
  process.exit(1);
}
