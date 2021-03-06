
/* This file is part of SOMHunter.
 *
 * Copyright (C) 2020 František Mejzlík <frankmejzlik@gmail.com>
 *                    Mirek Kratochvil <exa.exa@gmail.com>
 *                    Patrik Veselý <prtrikvesely@gmail.com>
 *
 * SOMHunter is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 2 of the License, or (at your option)
 * any later version.
 *
 * SOMHunter is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * SOMHunter. If not, see <https://www.gnu.org/licenses/>.
 */
"use strict";

const express = require("express");
const router = express.Router();
const path = require("path");

const SessionState = require("./common/SessionState");
const stateCheck = require("./common/state_checkers");

/** Specific route settings. */
const routeSettings = {
  slug: "somhunter",
};

function preProcessReq(req, viewData) {
  stateCheck.genericPreProcessReq(req, viewData, routeSettings);
}

function processReq(req, viewData) {
  stateCheck.genericProcessReq(req, viewData, routeSettings);
}

function postProcessReq(req, viewData) {
  stateCheck.genericPostProcessReq(req, viewData, routeSettings);
}
/**
 * GET request handler
 */
router.get("/", function (req, res, next) {
  const viewData = stateCheck.initRequest(req);

  global.logger.log("debug", "Route: " + routeSettings.slug);

  const sess = req.session;
  
  // Main request cycle
  preProcessReq(req, viewData);
  processReq(req, viewData);
  postProcessReq(req, viewData);

  let frames = [];
  // -------------------------------
  // Call the core
  const avail_disp = global.core.getAvailableDisplay(req.session.user);
  const lquery = global.core.getLastTextQuery(req.session.user);
  const displayFrames = global.core.getDisplay(req.session.user, global.cfg.framesPathPrefix, avail_disp, 0);
  frames = displayFrames.frames;
  // -------------------------------

  SessionState.switchScreenTo(sess.state, avail_disp, frames, 0);
  viewData.somhunter = SessionState.getSomhunterUiState(sess.state);
  viewData.somhunter.display_available = avail_disp;
  viewData.somhunter.textQueries.q0 = {value: lquery};

  // Resolve and render dedicated template
  res.render(routeSettings.slug, viewData);
});

module.exports = router;
