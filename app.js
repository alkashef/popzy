/**
 * Shoot the Unicorn Game
 * Copyright © 2025 Ahmad Alkashef (alkashef@gmail.com)
 * All rights reserved.
 * 
 * PROPRIETARY SOFTWARE - PERSONAL USE ONLY
 * This software is the exclusive property of Ahmad Alkashef.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 * 
 * Licensed exclusively to: Ahmad Alkashef
 * Contact: alkashef@gmail.com
 */

import { initApp } from './src/app/init.js';

// Minimal bootstrap: init when DOM is ready
async function init() { await initApp(); }

function bootstrap() { setTimeout(() => { init(); }, 0); }

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}