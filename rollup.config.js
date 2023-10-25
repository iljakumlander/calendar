import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import scss from 'rollup-plugin-scss';
import copy from 'rollup-plugin-copy';
import path from 'path';
import license from 'rollup-plugin-license';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json'
import dotenv from 'dotenv';

const production = process.env.NODE_ENV === 'production';
const destianion = production ? 'deploy' : 'watch';

dotenv.config({ path: './.env.client' + (production ? '.production' : '') });

export default [
  {
    input: 'src/client.tsx',
    output: {
      name: 'client',
      file: destianion + '/client/index.js',
      format: 'iife',
      sourcemap: !production
    },
    plugins: [
      json(),
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      scss({ fileName: destianion + '/client/index.css', watch: production ? undefined : 'src' }),
      typescript(),
      production && terser(),
      production && license({
        sourcemap: true,
        cwd: process.cwd(),
  
        banner: {
          commentStyle: 'regular',
  
          content: {
            file: path.join(__dirname, 'LICENSE'),
            encoding: 'utf-8',
          },

          data() {
            return {
              foo: 'foo',
            };
          },
        },
        thirdParty: {
          includePrivate: true,
          multipleVersions: true,
          output: {
            file: path.join(__dirname, destianion + '/client', 'dependencies.txt'),
            encoding: 'utf-8',
          },
        },
      }),
      copy({
        targets: [
          { src: 'LICENSE', dest: destianion + '/client' },
          { src: 'src/index.html', dest: destianion + '/client' },
          { src: 'static/**/*', dest: destianion + '/client' },
        ]
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
        'process.env.SERVER': JSON.stringify(process.env.SERVER),
      }),
    ],
  },
  {
    input: 'src/server.ts',
    output: {
      file: destianion + '/server/index.js',
      format: 'module'
    },
    plugins: [
      json(),
      resolve(),
      commonjs(),
      typescript(),
      copy({
        targets: [
          { src: destianion + '/client/**/*', dest: destianion + '/server/public' },
          { src: '.env.server' + (production ? '.production' : ''), dest: destianion + '/server' , rename: '.env' },
        ]
      }),
    ],
  }
];
