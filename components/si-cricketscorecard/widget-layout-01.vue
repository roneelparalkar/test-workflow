<template>
  <div v-if="!widgetData.err" class="waf-component waf-scorecard waf-cricketscorecard widget-layout-01 si-waf-widget" widget-id="si-cricket-scorecard-widget-layout-01" :data-gameCode="widgetData.gameCode" :data-defaulttab="widgetData.defaulttab" :is-mobile="widgetData.isMobile" :odds-link="widgetData.oddsLink" :partner-logo="widgetData.partnerLogo">

  <img id="wicket_image" class="wicket_image" height="10" width="10" src="/static-assets/images/chart-wicket-1.png?v=1" style="visibility:hidden;" v-if="widgetData.defaulttab=='graphs'"/>


  <div class="layout-wrapper">
    <div class="waf-head">
      <div class="head-wrap">
        <h3 class="title">
		{{widgetData.gameData.Teams[widgetData.gameData.Matchdetail.Team_Home].Name_Full}} vs
          {{widgetData.gameData.Teams[widgetData.gameData.Matchdetail.Team_Away].Name_Full}}, {{widgetData.gameData.Matchdetail.Match.Number}}</h3>
      </div>
	  
    </div>
    <div class="waf-body">
      <div class="content-wrap">
        <div class="card-section">
          <div class="card-item" :class="{'live':widgetData.gameData.Matchdetail.state=='L','upcoming':widgetData.gameData.Matchdetail.state=='U','completed':widgetData.gameData.Matchdetail.state=='R'}">
            <div class="card-wrap">
              <div class="card-header">
                
				<div class="head-wrap">
				  <span class="title">{{widgetData.gameData.Matchdetail.Series.Name}} |</span>
				  <span class="matchinfo">{{widgetData.gameData.Matchdetail.Match.Number}}</span>
				  <span class="match-time">| {{getDateTime1(widgetData.gameData.Matchdetail.Match.Date,widgetData.gameData.Matchdetail.Match.Time,widgetData.gameData.Matchdetail.Match.Offset,'dddd dS mmmm | HH:MM')}}</span>
				</div>
                <!--<span class="status">Live</span>-->
                <span class="status"><span class="si-mat-status" v-if="widgetData.gameData.Matchdetail.Day">Day -  {{widgetData.gameData.Matchdetail.Day}}, </span>&nbsp;{{widgetData.gameData.Matchdetail.Status}}</span>
              </div>
              <div class="card-content">
                <div class="team team-a">
                  <div class="team-info">
                    <img :onerror="'this.onerror=null;this.src=' + getDefaultFlag('60')"
                        :data-src="getDefaultFlag('60')"
                        :src="getTeamFlag({id:widgetData.gameData.Matchdetail.Team_Home}, '60')" class="team-logo">
				  <span class="team-name">{{widgetData.gameData.Teams[widgetData.gameData.Matchdetail.Team_Home].Name_Full}}</span>
                  </div>
                  
				  <div class="team-score" v-if="widgetData.gameData.Teams.scores && widgetData.gameData.Teams.scores[widgetData.gameData.Matchdetail.Team_Home] && widgetData.gameData.Teams.scores[widgetData.gameData.Matchdetail.Team_Home].scores">				  
					  <div class="scorecard-innings-wrap"
					  v-for="(score,inn) in widgetData.gameData.Teams.scores[widgetData.gameData.Matchdetail.Team_Home].scores">
					  <em class="and-txt" v-if="widgetData.gameData.Teams.scores[widgetData.gameData.Matchdetail.Team_Home].scores.length==2 && inn==1">& </em>
					  <span class="score">{{score.runs}}</span> <span class="si-overs">({{score.overs}})<em v-if="score.Runrate">
						  RR:</em>{{score.Runrate}}</span>
					  </div>                    
                  </div>
				  <div class="team-score" v-else-if="widgetData.gameData.Matchdetail.state ==='L'"><span>Yet to Bat </span></div>
				  
                </div>
                <div class="team team-b">
                  <div class="team-info">
                    <img :onerror="'this.onerror=null;this.src=' + getDefaultFlag('60')"
                        :data-src="getDefaultFlag('60')"
                        :src="getTeamFlag({id:widgetData.gameData.Matchdetail.Team_Away}, '60')" class="team-logo">
                    <span class="team-name">{{widgetData.gameData.Teams[widgetData.gameData.Matchdetail.Team_Away].Name_Full}}</span>
                  </div>
				  
                  <div class="team-score won" v-if="widgetData.gameData.Teams.scores && widgetData.gameData.Teams.scores[widgetData.gameData.Matchdetail.Team_Away] && widgetData.gameData.Teams.scores[widgetData.gameData.Matchdetail.Team_Away].scores">
                    <div class="scorecard-innings-wrap"
					  v-for="(score,inn) in widgetData.gameData.Teams.scores[widgetData.gameData.Matchdetail.Team_Away].scores">
					  <em class="and-txt" v-if="widgetData.gameData.Teams.scores[widgetData.gameData.Matchdetail.Team_Away].scores.length==2 && inn==1">&</em>
					  <span class="score">{{score.runs}}</span> <span class="si-overs">({{score.overs}})<em v-if="score.Runrate">
						  RR:</em>{{score.Runrate}}</span>
					</div>
                  </div>
				  <div class="team-score" v-else-if="widgetData.gameData.Matchdetail.state ==='L'"><span>Yet to Bat </span></div>
				  
                </div>
              </div>
              <div class="card-footer">
                <span class="team-status">{{widgetData.gameData.Matchdetail.sub_status}}</span>
              </div>
			  
			  
              <div class="end-match-footer" v-if="widgetData.gameData.Matchdetail.Player_Match">
                <span class="text">Player of the Match</span>
                <span class="player-name">{{widgetData.gameData.Matchdetail.Player_Match}}</span>
              </div>
              <div class="live-match-footer" >
                <div class="footer-wrap">
				
                  
				<div class="progress-wrap" v-if="widgetData.staticData.predictor && widgetData.staticData.predictor.length">
				  <span class="label highlight-label">Win Predictor</span>
				  <div class="result">
					<span class="label">{{widgetData.staticData.predictor[0].team_short_name}}</span>
					<span class="value value-a">{{widgetData.staticData.predictor[0].win_perc}}%</span>
					<div class="progress-bar">
					  <span :style="'width:'+widgetData.staticData.predictor[0].win_perc+'%;'"></span>
					</div>
					<span class="value value-b">{{widgetData.staticData.predictor[1].win_perc}}%</span>
					<span class="label">{{widgetData.staticData.predictor[1].team_short_name}}</span>
				  </div>
				</div> 
				  
				  
                  <div class="innings-info">
                    <div class="player-details batsman-details" v-if="widgetData.gameData.topBatsmen && widgetData.gameData.topBatsmen.players && widgetData.gameData.topBatsmen.players.length">
                      
					  <span class="label" v-if="widgetData.gameData.Matchdetail.state ==='L'">BATSMEN</span>
					  <span class="label" v-else>Top Batsmen</span>
				
					  <div class="player-info batsman-info" v-for="(p,i) in widgetData.gameData.topBatsmen.players">
                        <span class="player-name">{{p.Name_Full}} <span class="astric" v-if="p.isOnStrike">*</span></span>
                        <div class="player-score">
                          <span class="runs" v-for="(d,i) in p.details" v-if="i<1">{{d.runs}} ({{d.balls}})</span>
                          <span class="runs" v-for="(d,i) in p.details" v-if="i>0">& {{d.runs}} ({{d.balls}})</span>
                          <!--<span class="wickets">(3)</span>-->
                        </div>
                      </div>
                      
                    </div>
					
                    <div class="player-details bowler-details" v-if="widgetData.gameData.topBowlers && widgetData.gameData.topBowlers.players && widgetData.gameData.topBowlers.players.length">
                      
					  <span class="label" v-if="widgetData.gameData.Matchdetail.state ==='L'">BOWLERS</span>
					  <span class="label" v-else>Top Bowlers</span>
					  
					  <div class="player-info batsman-info" v-for="(p,i) in widgetData.gameData.topBowlers.players">
                        <span class="player-name">{{p.Name_Full}} <span class="astric" v-if="p.isBowlingNow">*</span></span>
                        <div class="player-score">
                          <span class="wickets" v-for="(d,i) in p.details" v-if="i<1">{{d.wickets}}/{{d.runs}} ({{d.overs}})</span>
						  <span class="wickets" v-for="(d,i) in p.details" v-if="i>0">& {{d.wickets}}/{{d.runs}} ({{d.overs}})</span>
						  
                        </div>
                      </div>
                    </div>
                  </div>
				  
                  
				  
				  <div class="runs-detail" v-if="widgetData.staticData.lastSixBalls && widgetData.staticData.lastSixBalls.length && !widgetData.gameData.Matchdetail.Result && !widgetData.gameData.Matchdetail.isso && widgetData.gameData.Matchdetail.Status_Id!='110'">
					<span class="label">Last 6 Balls:</span>
					<div class="run-info">
						<span class="run"
							:class="{'six':b.Runs==='6','four':b.Runs==='4','wicket': b.Iswicket,'four':b.Isboundary}"
							v-for="b in widgetData.staticData.lastSixBalls">
							<span v-if="b.Iswicket">w</span>
							<span v-else-if="b.Detail">
                {{b.Detail}}
                <span v-if="b.Detail" class="over-extra-score">
                {{b.Runs}}
                </span>
              </span>
              <span v-else>{{b.Runs}}</span>
						</span>										  
					</div>
				 </div>
				  
				  
                </div>
              </div>

            </div>
          </div>
        </div>
		
		
		<div v-if="getOddBetAd(widgetData.gameData.Matchdetail.state,widgetData.staticData.markets,true)" class="sites-or-odds" v-html="getOddBetAd(widgetData.gameData.Matchdetail.state,widgetData.staticData.markets,true)"></div>
        
		<div class="scorecard-container">
          <ul class="tabs scorecard-tab">
            <li class="tab-name" :class="{'tab-active':widgetData.defaulttab==='commentary'}" data-si-tabs="commentary" @click.stop.prevent="tabSelection('commentary')">
				<span v-if="widgetData.gameData.Innings">Commentary</span>
				<span v-else>Preview</span></li>
            <li class="tab-name" :class="{'tab-active':widgetData.defaulttab==='scorecard'}" data-si-tabs="scorecard" @click.stop.prevent="tabSelection('scorecard')">
				<span v-if="widgetData.gameData.Innings">Scorecard</span>
				<span v-else>Squads</span>
			</li>
            <li class="tab-name" :class="{'tab-active':widgetData.defaulttab==='graphs'}" data-si-tabs="graphs" @click.stop.prevent="tabSelection('graphs')" v-if="widgetData.gameData.chartsRequired"><span>Graphs</span></li>
			
            <li class="tab-name" :class="{'tab-active':widgetData.defaulttab==='polls'}" data-si-tabs="polls" @click.stop.prevent="tabSelection('polls')" v-if="widgetData.activePoll && widgetData.activePoll.length"><span>Polls</span><span class="total-poll">{{widgetData.activePoll.length}}</span></li>
            <li class="tab-name" :class="{'tab-active':widgetData.defaulttab==='match-info'}" data-si-tabs="match-info" @click.stop.prevent="tabSelection('match-info')"><span>Match Info</span></li>
          </ul>
          <div class="tab-container">
            <ul class="tabs scorecard-sub-tab" v-if="widgetData.defaulttab==='commentary' && widgetData.gameData.Innings && widgetData.gameData.Innings.length">
                  <li class="tab-name" v-for="(inn, index) in widgetData.gameData.Innings"
                data-inningsnumber="First" data-type="commentary" :data-inningsid="index" :data-selectedid="widgetData.selectedInn" data-tabtype="inning"
                :class="{'tab-active':index==widgetData.selectedInn}" @click="tabSelection('commentary','innings',index)">
				<span class="fullname">{{inn.Name_Full}}</span><span class="shortname">{{inn.Name_Short}}</span></li>                  
                </ul>
				
			<div class="commentary-tab-container" v-if="widgetData.defaulttab==='commentary' && widgetData.commentaryData.length" >
				
              <div class="si-comm-row" v-for="com in widgetData.commentaryData" :data-sourceId="com.source_id"
					:data-assetsId="com.id" :data-asset-order="com.asset_order">
			  
				  <div class="highlight-section" v-if="com.source_id==20">
					  <span class="social-icon"></span>
					  <h5 class="highlight-title">{{com.headline}}</h5>
					  <div class="si-comm-des" v-if="com.body && com.assets && com.assets.url!=''" :href="com.assets.url"><a target="_blank" :href="com.assets.url" v-html="com.body"> </a>
					  </div>
					  <div class="si-comm-des" v-else-if="com.body" v-html="com.body"></div>
				  </div>
				  <div class="content-section" v-if="com.source_id==1 || com.source_id==6 ||com.source_id==9 || com.source_id==12 || com.source_id==4" :class="{'si-imgCard':com.source_id==1 || com.source_id==9,'si-infoGraphicCard':com.source_id==12,'si-breaking-newsCard':com.source_id==6,'si-videoCard video-16by9':com.source_id==4}">
					  <h4 class="sub-title" v-if="com.headline">{{com.headline}}</h4>
					  			  
					  <div class="image-section" v-if="com.display_pic && com.display_pic!=''">
						  <img :src="com.display_pic" alt="" importance="low" class="lazy">
					  </div>
            <div v-else-if="com.source_id==4" class="video-section">
              <video onloadstart="this.volume=0.1" preload="metadata" width="100" height="100" controls>
                <source :src="com.custom_metadata.asset.embed_url+'#t=0.1'" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>
					  <div class="si-comm-des" v-else v-html="com.body"></div>
					  
				  </div>
				  <div class="over-info" v-if="com.source_id==2">
					  <div class="head" v-if="com.assets.Over_Summary">
						<div class="adds-or-odds" v-html="getOddBetAd(widgetData.gameData.Matchdetail.state, widgetData.staticData.markets,false)"></div>
						
						<div class="head-wrap">
						  <div class="over-info">
							<span class="over-text overs">Over: {{com.assets.Over_Summary.Over}} | </span>
							<span class="over-text runs" v-if="com.assets.Over_Summary.Runs==='0'">Maiden Over</span>
							<span class="over-text runs"
									v-else-if="com.assets.Over_Summary.Runs===1">{{com.assets.Over_Summary.Runs}}
									Run</span>
							<span class="over-text runs" v-else>{{com.assets.Over_Summary.Runs}} Runs</span>
								
						  </div>
						  <div class="match-info" v-if="com.assets.BattingTeam_Id && widgetData.gameData.Teams[com.assets.BattingTeam_Id]">
							<span class="over-text name">{{widgetData.gameData.Teams[com.assets.BattingTeam_Id].Name_Short}}:</span>
							<span class="over-text score">{{com.assets.Over_Summary.Score}}</span>
						  </div>
						</div>
					  </div>
					  <div class="body">
						<div class="over-list">
						  <div class="over-item" :class="{'wicket':com.assets.Iswicket,'six':com.assets.Runs>=6,'four':com.assets.Runs>=4}">
							<div class="over-wrap">
							  <div class="over-details" v-if="com.assets.Isball">
								
								<span class="over-score" v-if="com.assets.Iswicket">W</span>
								<span class="over-score" v-else-if="com.assets.Detail">{{com.assets.Detail}}
								  <span class="over-extra-score">{{com.assets.Runs}}</span>
								</span>
                <span class="over-score" v-else>{{com.assets.Runs}}</span>
										
								<span class="over-count">{{com.assets.Over}}</span>
							  </div>
							  <div class="over-commentary" :class="{'commentary-txt':com.assets.Isball}">
								<h5 class="commentary-title" v-if="com.assets.Bowler_Name">{{com.assets.Bowler_Name}} to {{com.assets.Batsman_Name}}</h5>
								<p class="commentary-text">{{com.assets.Commentary}}</p>
							  </div>
							</div>
						  </div>					  
						</div>
					  </div>
					</div>
				</div>
				
				<div class="btn-action" v-if="widgetData.loadmore" @click.stop="tabSelection('commentary','loadmore',widgetData.selectedInn)">Load More</div>
			
			</div>
      <div class="commentary-tab-container" v-else-if="widgetData.defaulttab==='commentary' && !widgetData.commentaryData.length && (getDateTime1(widgetData.gameData.Matchdetail.Match.Date,widgetData.gameData.Matchdetail.Match.Time,widgetData.gameData.Matchdetail.Match.Offset,'yyyy') && +getDateTime1(widgetData.gameData.Matchdetail.Match.Date,widgetData.gameData.Matchdetail.Match.Time,widgetData.gameData.Matchdetail.Match.Offset,'yyyy') < 2017)">
				<div class="content-section">No Commentary available for this match</div>
			</div> 
			<div class="commentary-tab-container" v-else-if="widgetData.defaulttab==='commentary' && !widgetData.commentaryData.length && !widgetData.commAPILoading">
				<div class="content-section">DATA WILL BE AVAILABLE SHORTLY</div>
			</div>
			<div class="scorecard-tab-container" v-if="widgetData.defaulttab==='scorecard'">
              <div class="container-wrap">
                
				<ul class="tabs scorecard-sub-tab">
                  <li class="tab-name" v-if="widgetData.gameData.Innings && widgetData.gameData.Innings.length" v-for="(inn, index) in widgetData.gameData.Innings"
                data-inningsnumber="First" data-type="scorecard" data-inningsid="0" data-tabtype="inning"
                :class="{'tab-active':index==widgetData.selectedInn}" @click="tabSelection('scorecard','innings',index)">
				<span class="fullname">{{inn.Name_Full}}</span><span class="shortname">{{inn.Name_Short}}</span></li>     
					
				<li class="tab-name" v-if="widgetData.gameData.squads && widgetData.gameData.squads.length" v-for="(team, index) in widgetData.gameData.squads"
                data-inningsnumber="First" data-type="scorecard" :data-inningsid="index" data-tabtype="squads"
                :class="{'tab-active':team.id==widgetData.selectedTeam}" @click="tabSelection('scorecard','squads',team.id)"><span class="fullname">{{team.Name_Full}}</span><span class="shortname">{{team.Name_Short}}</span></li>
				
                </ul>
							
				<div v-if="widgetData.gameData.Innings && widgetData.gameData.Innings[widgetData.selectedInn] && widgetData.selectedInn>=0">
                <div class="sub-container-wrap">
                  <div class="team-score-detail">
                    <div class="detail-part1">
                      <div class="team-flag">
                        
						<img :onerror="'this.onerror=null;this.src=' + getDefaultFlag('60')"
                        :data-src="getDefaultFlag('60')"
                        :src="getTeamFlag({id:widgetData.gameData.Innings[widgetData.selectedInn].Battingteam}, '60')" class="team-logo" importance="low">
                      </div>
                      <!--<span v-if="widgetData.isMobile" class="team-name">{{widgetData.gameData.Innings[widgetData.selectedInn].Name_Short}}</span>
                      <span v-else class="team-name">{{widgetData.gameData.Innings[widgetData.selectedInn].Name_Full}}</span>-->
					  <span class="fullname team-name">{{widgetData.gameData.Innings[widgetData.selectedInn].Name_Full}}</span>
					  <span class="shortname team-name">{{widgetData.gameData.Innings[widgetData.selectedInn].Name_Short}}</span>

                    </div>
                    <div class="detail-part2">
                      <span class="runs">{{widgetData.gameData.Innings[widgetData.selectedInn].Total}}/{{widgetData.gameData.Innings[widgetData.selectedInn].Wickets}}</span>
                      <span class="overs">({{widgetData.gameData.Innings[widgetData.selectedInn].Overs}} overs)</span>
                      <span class="over-runrate">CRR: {{widgetData.gameData.Innings[widgetData.selectedInn].Runrate}} rpo</span>
                    </div>
                  </div>
                  <div class="batting-scorecard">
                    <div class="table-responsive">
                      <div class="table batting-table">
                        <div class="table-head">
                          <div class="table-row">
                            <div class="table-data label">
                              <span>Batting</span>
                            </div>
                            <div class="table-data player-runs">
                              <span>R</span>
                            </div>
                            <div class="table-data player-balls">
                              <span>B</span>
                            </div>
                            <div class="table-data player-fours">
                              <span>4s</span>
                            </div>
                            <div class="table-data player-sixes">
                              <span>6s</span>
                            </div>
                            <div class="table-data strike-rate">
                              <span>S/R</span>
                            </div>
                          </div>
                        </div>
                        <div class="table-body">
                          <div class="table-row" v-for="(batsmen,index) in widgetData.gameData.Innings[widgetData.selectedInn].Batsmen">
                            <div class="table-data label">
                              <span class="name">{{getPlayerName(batsmen.Batsman,widgetData.gameData.Teams[widgetData.gameData.Innings[widgetData.selectedInn].Battingteam])}}</span>
                              <span class="status">{{batsmen.Howout}}</span>
                            </div>
                            <div class="table-data player-runs">
                              <span>{{batsmen.Runs}}</span>
                            </div>
                            <div class="table-data player-balls">
                              <span>{{batsmen.Balls}}</span>
                            </div>
                            <div class="table-data player-fours">
                              <span>{{batsmen.Fours}}</span>
                            </div>
                            <div class="table-data player-sixes">
                              <span>{{batsmen.Sixes}}</span>
                            </div>
                            <div class="table-data strike-rate">
                              <span>{{batsmen.Strikerate}}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="extras-scorecard">
                    <span class="label">Extras:</span>
                    <span class="extra-info"> {{widgetData.gameData.Innings[widgetData.selectedInn].extras}} Runs ((B:
                    {{widgetData.gameData.Innings[widgetData.selectedInn].Byes}}, LB: {{widgetData.gameData.Innings[widgetData.selectedInn].Legbyes}}, NB:
                    {{widgetData.gameData.Innings[widgetData.selectedInn].Noballs}}, WD: {{widgetData.gameData.Innings[widgetData.selectedInn].Wides}}, P:
                    {{widgetData.gameData.Innings[widgetData.selectedInn].Penalty}}))</span>
                  </div>
                  <section id="" data-component="si-ads" data-template="widget_layout_01">
                  </section>
                  <div class="wicket-scorecard" v-if="widgetData.gameData.Innings[widgetData.selectedInn].FallofWickets && widgetData.gameData.Innings[widgetData.selectedInn].FallofWickets.length">
                    <div class="table-responsive">
                      <div class="table wicket-table">
                        <div class="table-head">
                          <div class="table-row">
                            <div class="table-data label">
                              <span>Fall of Wickets</span>
                            </div>
                            <div class="table-data overs">
                              <span>Overs</span>
                            </div>
                          </div>
                        </div>
                        <div class="table-body">
                          <div class="table-row" v-for="(fow,index) in widgetData.gameData.Innings[widgetData.selectedInn].FallofWickets">
                            <div class="table-data label">
                              <span class="fall-wicket-run">{{fow.Score}} - {{index+1}}</span>
                              <span class="name">{{getPlayerName(fow.Batsman,widgetData.gameData.Teams[widgetData.gameData.Innings[widgetData.selectedInn].Battingteam])}}</span>
                            </div>
                            <div class="table-data overs">
                              <span>{{fow.Overs}}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
				  <section id="" data-component="si-ads" data-template="widget_layout_01">
                  </section>
				  
                  <div class="team-score-detail">
                    <div class="detail-part1">
                      <div class="team-flag">
                        <img :onerror="'this.onerror=null;this.src=' + getDefaultFlag('60')"
                        :data-src="getDefaultFlag('60')"
                        :src="getTeamFlag({id:widgetData.gameData.Innings[widgetData.selectedInn].Bowlingteam}, '60')" class="team-logo" importance="low">
                      </div>
                      <!--<span v-if="widgetData.isMobile" class="team-name">{{widgetData.gameData.Teams[widgetData.gameData.Innings[widgetData.selectedInn].Bowlingteam].Name_Short}}</span>
                      <span v-else class="team-name">{{widgetData.gameData.Teams[widgetData.gameData.Innings[widgetData.selectedInn].Bowlingteam].Name_Full}}</span>-->
					  
					  <span class="fullname team-name">{{widgetData.gameData.Teams[widgetData.gameData.Innings[widgetData.selectedInn].Bowlingteam].Name_Full}}</span>
					  <span class="shortname team-name">{{widgetData.gameData.Teams[widgetData.gameData.Innings[widgetData.selectedInn].Bowlingteam].Name_Short}}</span>
					  
                    </div>
                  </div>
                  <div class="bowling-scorecard" v-if="widgetData.gameData.Innings[widgetData.selectedInn].Bowlers && widgetData.gameData.Innings[widgetData.selectedInn].Bowlers.length">
                    <div class="table-responsive">
                      <div class="table bowling-table">
                        <div class="table-head">
                          <div class="table-row">
                            <div class="table-data label">
                              <span>Bowling</span>
                            </div>
                            <div class="table-data player-overs">
                              <span>O</span>
                            </div>
                            <div class="table-data player-maidenover">
                              <span>M</span>
                            </div>
                            <div class="table-data runs-given-by-player">
                              <span>R</span>
                            </div>
                            <div class="table-data player-wickets">
                              <span>W</span>
                            </div>
                            <div class="table-data no-ball">
                              <span>NB</span>
                            </div>
                            <div class="table-data wide-ball">
                              <span>WD</span>
                            </div>
                            <div class="table-data economy-rate">
                              <span>E/R</span>
                            </div>
                          </div>
                        </div>
                        <div class="table-body">
                          <div class="table-row" v-for="bowler in widgetData.gameData.Innings[widgetData.selectedInn].Bowlers">
                            <div class="table-data label">
                              <span class="name">{{getPlayerName(bowler.Bowler,widgetData.gameData.Teams[widgetData.gameData.Innings[widgetData.selectedInn].Bowlingteam])}}</span>
                            </div>
                            <div class="table-data player-overs">
                              <span>{{bowler.Overs}}</span>
                            </div>
                            <div class="table-data player-maidenover">
                              <span>{{bowler.Maidens}}</span>
                            </div>
                            <div class="table-data runs-given-by-player">
                              <span>{{bowler.Runs}}</span>
                            </div>
                            <div class="table-data player-wickets">
                              <span>{{bowler.Wickets}}</span>
                            </div>
                            <div class="table-data no-ball">
                              <span>{{bowler.Noballs}}</span>
                            </div>
                            <div class="table-data wide-ball">
                              <span>{{bowler.Wides}}</span>
                            </div>
                            <div class="table-data economy-rate">
                              <span>{{bowler.Economyrate}}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
				</div>
				<!--<div v-if="widgetData.selectedTeam && widgetData.selectedTeam>0">-->
				<div v-if="widgetData.selectedInn<0">
				<div class="sub-container-wrap squad">
				<div class="batting-scorecard">
                    <div class="table-responsive">
                      <div class="table batting-table">
                        <div class="table-head">
                          <div class="table-row">
                            <div class="table-data label">
                              <span>Squads</span>
                            </div>
                            <div class="table-data player-runs">
                              <span>M</span>
                            </div>
                            <div class="table-data player-balls">
                              <span>R</span>
                            </div>
                            <div class="table-data player-fours">
                              <span>Bat Avg</span>
                            </div>
                            <div class="table-data player-sixes">
                              <span>W</span>
                            </div>
                            <div class="table-data strike-rate">
                              <span>E/R</span>
                            </div>
                          </div>
                        </div>
                        <div class="table-body">
                          <div class="table-row" v-for="player in widgetData.gameData.squadsPlayer">
                            <div class="table-data label">
                              <span class="name">{{player.Name_Full}}</span>                              
                            </div>
                            <div class="table-data player-runs">
                              <span>{{player.Matches}}</span>
                            </div>
                            <div class="table-data player-balls">
                              <span>{{player.Batting.Runs}}</span>
                            </div>
                            <div class="table-data player-fours">
                              <span>{{player.Batting.Average}}</span>
                            </div>
                            <div class="table-data player-sixes">
                              <span>{{player.Bowling.Wickets}}</span>
                            </div>
                            <div class="table-data strike-rate">
                              <span>{{player.Bowling.Economyrate}}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
				</div>
				</div>
				
              </div>
            </div>
            
			<div class="graph-tab-container" v-if="widgetData.defaulttab==='graphs' && widgetData.graphtype!=''">
              <div class="container-wrap">
				
				<ul class="tabs scorecard-sub-tab" v-if="widgetData.gameData.Matchdetail.Match.Type.toLowerCase() ==='odi' || widgetData.gameData.Matchdetail.Match.Type.toLowerCase() ==='t20' || widgetData.gameData.Matchdetail.Match.Type.toLowerCase() ==='t20i'">
				  <li class="tab-name" :class="{'tab-active':widgetData.graphtype=='manhattan'}" @click.stop.prevent="tabSelection('graphs','manhattan')"><span>Manhattan</span></li>
				  <li class="tab-name" :class="{'tab-active':widgetData.graphtype=='ingprg'}" @click.stop.prevent="tabSelection('graphs','ingprg')"><span>Innings Progression</span></li>
				  <li class="tab-name" :class="{'tab-active':widgetData.graphtype=='runrate'}" @click.stop.prevent="tabSelection('graphs','runrate')"><span>Run Rate</span></li>
				  <li class="tab-name" :class="{'tab-active':widgetData.graphtype=='spider'}" @click.stop.prevent="tabSelection('graphs','spider')"><span>Spider</span></li>
				  <li class="tab-name" :class="{'tab-active':widgetData.graphtype=='wagonwheel'}" @click.stop.prevent="tabSelection('graphs','wagonwheel')"><span>Wagon Wheel</span></li>
				</ul>
				<ul class="tabs scorecard-sub-tab" v-else>
				  <li class="tab-name" :class="{'tab-active':widgetData.graphtype=='spider'}" @click.stop.prevent="tabSelection('graphs','spider')"><span>Spider</span></li>
				  <li class="tab-name" :class="{'tab-active':widgetData.graphtype=='wagonwheel'}" @click.stop.prevent="tabSelection('graphs','wagonwheel')"><span>Wagon Wheel</span></li>
				</ul>
				
				<div class="team-info-section">
				  <!-- For Manhattan, Innings Progression and Run Rate use this top wrapper for team color denotation  -->
				  <div class="team-info-wrap" v-if="widgetData.graphtype=='manhattan' || widgetData.graphtype=='ingprg' || widgetData.graphtype=='runrate'">
					<div class="team-info team-a">
					  <span class="color-fill"></span>
					  <span class="team-name">{{widgetData.gameData.Teams[widgetData.gameData.Matchdetail.Team_Home].Name_Full}}</span>
					</div>
					<div class="team-info team-b">
					  <span class="color-fill"></span>
					  <span class="team-name">{{widgetData.gameData.Teams[widgetData.gameData.Matchdetail.Team_Away].Name_Full}}</span>
					</div>
				  </div>
				  <!-- For Spider and Wagon Wheel use this top wrapper for team color denotation -->
				  <div class="team-info-wrap team-info-sub-wrap" v-if="widgetData.graphtype=='spider' || widgetData.graphtype=='wagonwheel'">
					
					<div class="team-info" v-if="widgetData.gameData.Innings && widgetData.gameData.Innings.length" v-for="(inn, index) in widgetData.gameData.Innings" @click.stop.prevent="tabSelection('graphs',widgetData.graphtype,index)" :class="{'tab-active':index==widgetData.selectedInn}" v-html="getInningName(index)" :data-index="index">
					  
					</div>
					</div>
									
				  </div>
				</div>
                                
				<div class="manhattan-section" v-if="widgetData.graphtype=='manhattan'">
				  <div class="inner-wrap">
					<div class="score-line" v-if="widgetData.graphsData.yAxis">
					  <div class="score-label">
						<span>Runs</span>
					  </div>
					  <div class="line-wrap" v-for="r in widgetData.graphsData.yAxis">
						<span class="lable">{{r}}</span>
					  </div>					  
					</div>
					<div class="graph-listing glider-contain">
					  <div class="graph-wrap glider">
              <div class="graph-item glider-slide" v-for="(over,index) in widgetData.graphsData.overs">
                <div class="bar-wrap">
                  <div class="bar-graph-line team-a" :data-over="index+1" :style="' background-color:'+over[0].color+';height:'+over[0].percent" :title="index+1">
                    <div class="wicket-wrap">
                      <div class="wicket-text" v-for="(wkt,w) in over[0].totalWicket">
                        <span>w</span>
                        <div class="graph-info wicket-info" v-html="getWicketDetail(wkt.id,wkt.Batsman)"></div>
                      </div>
                    </div>
                    <div class="graph-info bar-info">
                      <span class="text">Over {{index+1}} - {{over[0].Bowler}}</span>
                      <span class="text">{{over[0].Runs}} runs</span>
                    </div>
                  </div>
                                    
                  <div class="bar-graph-line team-b" v-if="over.length==2" :data-over="index+1" :style="' background-color:'+over[1].color+';height:'+over[1].percent" :title="index+1">
                    <div class="wicket-wrap">
                      <div class="wicket-text" :class="['si-wicket'+w]" v-for="(wkt,w) in over[1].totalWicket">
                        <span>w</span>
                        <div class="graph-info wicket-info" v-html="getWicketDetail(wkt.id,wkt.Batsman)">  </div>
                      </div>
                    </div>
                    <div class="graph-info bar-info">
                     <span class="text">Over {{index+1}} - {{over[1].Bowler}}</span>
                      <span class="text">{{over[1].Runs}} runs</span>
                    </div>
                  </div>
                </div>
                <span class="graph-value">{{index+1}}</span>
              </div>
					  </div>
            <div class="over-label">
              <button class="glider-nav glider-prev" id="glider-prev-resp"></button>
              <span>Overs</span>
              <button class="glider-nav glider-next" id="glider-next-resp"></button>
            </div>
          </div>
				  </div>          
				</div>
				
				<div class="innings-progression-section" v-if="widgetData.graphtype=='ingprg'">
				  <div class="inner-wrap">
					<div class="score-line">
					  <div class="score-label">
						<span>Runs</span>
					  </div>
					  <div class="over-label">
						<span>Overs</span>
					  </div>
					</div>
				
					<span class="si-mtooltip">
						<div class="graph-info cwl-runrate-tooltip" style="display:none">
							<span class="si-plyr-name full-name text"></span>
							<span class="si-runs text"></span>
							<span class="si-howout text"></span>
						</div>	
					</span>
			
					<div class="graph-listing canvas si-chatswipe" style="width:100%;">
					  <div class="runrate-worm-graph" style="height:280px;width:100%;"></div>

					</div>
				  </div>
				</div>
				
				<div class="run-rate-section" v-if="widgetData.graphtype=='runrate'">
				  <div class="inner-wrap">
					<div class="score-line">
					  <div class="score-label">
						<span>Runs</span>
					  </div>
					  
					  <div class="over-label">
						<span>Overs</span>
					  </div>
					</div>
					<div class="graph-listing canvas si-chatswipe" style="width:100%;">
					  <div class="runrate-worm-graph" style="width:100%">
					  <canvas class="runrateWormCanvas" id="runrateWormCanvas1" style="height: 280px; width: 100%;" width="100%" height="280"></canvas>
					  </div>
					</div>
				  </div>
				</div>
				
				<div class="spider-section" v-if="widgetData.graphtype=='spider'">
				  <div class="inner-wrap">
					<div class="svg-section-container">
					  <div class="svg-section">
						<div class="svg-graph">
						<div class="svg-div si-spider-svg-container" id="si-spider-svg-container-graph"></div>
						</div>
						
						<div class="zone-listing">
						  <div class="zone-item item-one">
							<span class="data">{{widgetData.batsmanGraphsData.zone1}}</span>
						  </div>
						  <div class="zone-item item-two">
							<span class="data">{{widgetData.batsmanGraphsData.zone2}}</span>
						  </div>
						  <div class="zone-item item-three">
							<span class="data">{{widgetData.batsmanGraphsData.zone3}}</span>
						  </div>
						  <div class="zone-item item-four">
							<span class="data">{{widgetData.batsmanGraphsData.zone4}}</span>
						  </div>
						  <div class="zone-item item-five">
							<span class="data">{{widgetData.batsmanGraphsData.zone5}}</span>
						  </div>
						  <div class="zone-item item-six">
							<span class="data">{{widgetData.batsmanGraphsData.zone6}}</span>
						  </div>
						  <div class="zone-item item-seven">
							<span class="data">{{widgetData.batsmanGraphsData.zone7}}</span>
						  </div>
						  <div class="zone-item item-eight">
							<span class="data">{{widgetData.batsmanGraphsData.zone8}}</span>
						  </div>
						</div>
					  </div>
					</div>
					<div class="svg-controls-section">
					  <div class="controls-list">
						<div class="controls-item item1">
						  <span class="number">1s</span>
						  <span class="runs">{{widgetData.batsmanGraphsData.run1}}</span>
						</div>
						<div class="controls-item item2">
						  <span class="number">2s</span>
						  <span class="runs">{{widgetData.batsmanGraphsData.run2}}</span>
						</div>
						<div class="controls-item item3">
						  <span class="number">3s</span>
						  <span class="runs">{{widgetData.batsmanGraphsData.run3}}</span>
						</div>
						<div class="controls-item item4">
						  <span class="number">4s</span>
						  <span class="runs">{{widgetData.batsmanGraphsData.run4}}</span>
						</div>
						<div class="controls-item item5">
						  <span class="number">6s</span>
						  <span class="runs">{{widgetData.batsmanGraphsData.run6}}</span>
						</div>
					  </div>
					</div>
				  </div>
				</div>
				
				<div class="wagonwheel-section" v-if="widgetData.graphtype=='wagonwheel'">
				  <div class="inner-wrap">
					<div class="svg-section-container">
					  <div class="svg-section">
						<svg class="svg-graph">
						
						</svg>
						
						<div class="zone-listing">
						  <div class="zone-item item-one">
							<span class="data">{{widgetData.batsmanGraphsData.zone1}}</span>
						  </div>
						  <div class="zone-item item-two">
							<span class="data">{{widgetData.batsmanGraphsData.zone2}}</span>
						  </div>
						  <div class="zone-item item-three">
							<span class="data">{{widgetData.batsmanGraphsData.zone3}}</span>
						  </div>
						  <div class="zone-item item-four">
							<span class="data">{{widgetData.batsmanGraphsData.zone4}}</span>
						  </div>
						  <div class="zone-item item-five">
							<span class="data">{{widgetData.batsmanGraphsData.zone5}}</span>
						  </div>
						  <div class="zone-item item-six">
							<span class="data">{{widgetData.batsmanGraphsData.zone6}}</span>
						  </div>
						  <div class="zone-item item-seven">
							<span class="data">{{widgetData.batsmanGraphsData.zone7}}</span>
						  </div>
						  <div class="zone-item item-eight">
							<span class="data">{{widgetData.batsmanGraphsData.zone8}}</span>
						  </div>
						</div>
					  </div>
					</div>
				  </div>
				</div>
              </div>
            
            
			<div class="poll-tab-container" v-if="widgetData.defaulttab==='polls'">
              <div class="container-wrap" v-if="widgetData.activePoll && widgetData.activePoll.length">
                <div class="poll-head">
                  <h4 class="title">Polls Attempted:</h4>
                  <span class="poll-score"> <span class="count" v-html="checkAnsweredPoll()"></span> /{{widgetData.activePoll.length}}</span>
                </div>
                <div class="poll-body">
                  <div class="poll-list">
                    <div class="poll-item" v-for="(poll,index) in widgetData.activePoll" :data-sourceId="poll.source_id" :data-assetsId="poll.id" :data-asset-order="poll.asset_order" v-if="poll.assets && poll.assets.options">
                      <div class="poll-wrapper">
                        <div class="poll-question">
                          <p class="question">{{poll.assets.poll}}</p>
                          <div class="button-group" v-if="!poll.results.length">
                            <button class="btn btn-yes" @click="postFanshoutData(poll,poll.id,0,poll.is_active,poll.assets.options)">{{poll.assets.options[0]}}</button>
                            <button class="btn btn-no" @click="postFanshoutData(poll,poll.id,1,poll.is_active,poll.assets.options)">{{poll.assets.options[1]}}</button>
                          </div>
                        </div>
                        <div class="progress-section" v-if="poll.results.length">
                          <div class="progress-wrap">
                            <div class="result">
                              <span class="start-value">{{poll.results[0].per}}</span>
                              <div class="progress-bar">
                                <span :style="'width:'+poll.results[0].per+';'"></span>
                              </div>
                              <span class="end-value">{{poll.results[1].per}}</span>
                            </div>
                            <div class="progress-labels">
                              <span class="label">{{poll.assets.options[0]}}</span>
                              <span class="label highlight-label" v-if="poll.msgOwner">{{poll.msgOwner}}</span>
                              <span class="label">{{poll.assets.options[1]}}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Add class="show=results" next to poll-item for show/hide of class="progress-section"(progress bar)  -->
                    
                  </div>
                  <section id="" data-component="si-ads" data-template="widget_layout_01">
                  </section>
                </div>
              </div>
			  <div v-else class="content-section">DATA WILL BE AVAILABLE SHORTLY</div>
			</div>
            
			<div class="matchinfo-tab-container" v-if="widgetData.defaulttab==='match-info'">
              <div class="container-wrap">
                <div class="matchinfo-list">
                  <div class="matchinfo-item">
                    <span class="info-label">Match</span>
                    <span class="info">{{widgetData.gameData.Matchdetail.Match.Number}}</span>
                  </div>
                  <div class="matchinfo-item">
                    <span class="info-label">Venue</span>
                    <span class="info">{{widgetData.gameData.Matchdetail.Venue.Name}}</span>
                  </div>
                  <div class="matchinfo-item">
                    <span class="info-label">Date & Time</span>
                    <span class="info">{{getDateTime1(widgetData.gameData.Matchdetail.Match.Date,widgetData.gameData.Matchdetail.Match.Time,widgetData.gameData.Matchdetail.Match.Offset,'dddd dS mmmm | HH:MM')}}</span>
                  </div>
                  <div class="matchinfo-item">
                    <span class="info-label">Series</span>
                    <span class="info">{{widgetData.gameData.Matchdetail.Series.Name}}</span>
                  </div>
                  <div class="matchinfo-item">
                    <span class="info-label">Weather</span>
                    <span class="info">{{widgetData.gameData.Matchdetail.Weather}}</span>
                  </div>
                  <div class="matchinfo-item">
                    <span class="info-label">Toss</span>
                    <span class="info">{{widgetData.gameData.Matchdetail.toss}}</span>
                  </div>
                  <div class="matchinfo-item">
                    <span class="info-label">Umpires</span>
                    <span class="info" v-if="widgetData.gameData.Matchdetail.Officials && widgetData.gameData.Matchdetail.Officials.Umpires">{{widgetData.gameData.Matchdetail.Officials.Umpires}}</span>
                  </div>
                  <div class="matchinfo-item" >
                    <span class="info-label" >Referee</span>
                    <span class="info" v-if="widgetData.gameData.Matchdetail.Officials && widgetData.gameData.Matchdetail.Officials.Referee" >{{widgetData.gameData.Matchdetail.Officials.Referee}}</span>
                  </div>
                  <div class="matchinfo-item">
                    <span class="info-label">Player of the Match</span>
                    <span class="info" v-if="widgetData.gameData.Matchdetail.Player_Match">{{widgetData.gameData.Matchdetail.Player_Match}}</span>
                  </div>
                </div>
                <section id="" data-component="si-ads" data-template="widget_layout_01">
                </section>
              </div>
            </div>
          </div>
		  </div>
        </div>
      </div>
    </div>
  </div>
</div>
  
  </div>
</template>

<script>
import { hasMultipleInnings, getTeamFlag, getInningsScore } from "./../../sdk/WidgetLibrary/utils";


export default {
  head(){
    let bettingScoreCardMarkup = this.widgetData.bettingSitesComponent && this.widgetData.bettingSitesComponent.ad_code ? this.widgetData.bettingSitesComponent.ad_code:''
    let adScoreCardMarkup = this.widgetData.adComponent && this.widgetData.adComponent.ad_code ? this.widgetData.adComponent.ad_code:''
    return {
      __dangerouslyDisableSanitizers: ["script"],
      script:[
        {
            innerHTML: `
              window.adMarkup = \`${adScoreCardMarkup}\`,
              window.bettingSiteMarkup = \`${bettingScoreCardMarkup}\`;
            `,
            charset: "UTF-8",
            body: true
          }
      ]
    }
  },
  props: {
    widgetData: Object,
	  selectedLanguage: String,
    translations: Object,
    imagePaths: Object,
    winstonLogger: Object,
    configData:Object
  },
  methods: {
    getInningsScore: function(participant, innings) {
      return getInningsScore(this.winstonLogger, participant.value, innings);
    },
    hasMultipleInnings: function(participant) {
      return hasMultipleInnings(this.winstonLogger, participant.value);
    },
    getTeamFlag: function(participantsObj) {
		return getTeamFlag(this.winstonLogger, this.imagePaths, participantsObj, 1);
    },
    getDefaultFlag: function() {
      return getTeamFlag(this.winstonLogger, this.imagePaths, false, this.widgetData.sport);
    },
	getDateTime1: function(date, time, offset, format){
	
	  var d = date.split('/');
	  if (d[0].length == 1) d[0] = '0' + d[0];
	  if (d[1].length == 1) d[1] = '0' + d[1];
	  var _date = d[2] + '-' + d[0] + '-' + d[1] + 'T' + time + offset;
	  
	  return getDateTime(_date, format)
	  
	  function getDateTime(date, format){
        let isValidDate = function (t) { var e = new Date(t); return "[object Date]" === Object.prototype.toString.call(e) ? isNaN(e.getTime()) ? !1 : !0 : !1 }, dateFormat = function () { var t = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g, e = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g, a = /[^-+\dA-Z]/g, m = function (t, e) { for (t = String(t), e = e || 2; t.length < e;)t = "0" + t; return t }; return function (n, d, r) { if (isValidDate(n)) { var y = dateFormat; 1 != arguments.length || "[object String]" != Object.prototype.toString.call(n) || /\d/.test(n) || (d = n, n = void 0), n = n ? new Date(n) : new Date, d = String(y.masks[d] || d || y.masks["default"]), "UTC:" == d.slice(0, 4) && (d = d.slice(4), r = !0); var i = r ? "getUTC" : "get", s = n[i + "Date"](), o = n[i + "Day"](), u = n[i + "Month"](), M = n[i + "FullYear"](), l = n[i + "Hours"](), T = n[i + "Minutes"](), c = n[i + "Seconds"](), h = n[i + "Milliseconds"](), g = r ? 0 : n.getTimezoneOffset(), D = { d: s, dd: m(s), ddd: y.i18n.dayNames[o], dddd: y.i18n.dayNames[o + 7], m: u + 1, mm: m(u + 1), mmm: y.i18n.monthNames[u], mmmm: y.i18n.monthNames[u + 12], yy: String(M).slice(2), yyyy: M, h: l % 12 || 12, hh: m(l % 12 || 12), H: l, HH: m(l), M: T, MM: m(T), s: c, ss: m(c), l: m(h, 3), L: m(h > 99 ? Math.round(h / 10) : h), t: 12 > l ? "a" : "p", tt: 12 > l ? "am" : "pm", T: 12 > l ? "A" : "P", TT: 12 > l ? "AM" : "PM", Z: r ? "UTC" : (String(n).match(e) || [""]).pop().replace(a, ""), o: (g > 0 ? "-" : "+") + m(100 * Math.floor(Math.abs(g) / 60) + Math.abs(g) % 60, 4), S: ["th", "st", "nd", "rd"][s % 10 > 3 ? 0 : (s % 100 - s % 10 != 10) * s % 10] }; return d.replace(t, function (t) { return t in D ? D[t] : t.slice(1, t.length - 1) }) } } }(); dateFormat.masks = { "default": "ddd mmm dd yyyy HH:MM:ss", shortDate: "m/d/yy", mediumDate: "mmm d, yyyy", longDate: "mmmm d, yyyy", fullDate: "dddd, mmmm d, yyyy", shortTime: "h:MM TT", mediumTime: "h:MM:ss TT", longTime: "h:MM:ss TT Z", isoDate: "yyyy-mm-dd", isoTime: "HH:MM:ss", isoDateTime: "yyyy-mm-dd'T'HH:MM:ss", isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'" }, dateFormat.i18n = { dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] }, Date.prototype.format = function (t, e) { return dateFormat(this, t, e) };
        let thisdte = new Date(date);
        return thisdte.format(format);
       }
		  
	},
	getPlayerName: (player, playerslist) => {
	  var name = player;

	  for (var p in playerslist.Players) {
		var b = playerslist.Players[p];
		if (p == player) {
		  name = b.Name_Full;
		  if (b.Iscaptain) name += ' (c)';
		  if (b.Iskeeper) name += ' (w)';
		  break;
		}
	  }
	  return name;
	},
	
	getOddBetAd:function(state,markets,isFirst){
    let mrkp=""
    if(this.widgetData.isServer) return mrkp;

		if(state!=="R" && markets && markets.length){
			mrkp=`<a href="${this.widgetData.oddsLink}" target="_blank" class="odds-section"><span class="odds-header">Betting Odds</span><div class="odds-list">`
			for(var i=0;i<markets.length;i++){
				var name = markets[i].name;
				if(name){			
				  name=name.replace('Delhi Capitals','Delhi').replace('Punjab Kings','Punjab').replace('Mumbai Indians','Mumbai').replace('Rajasthan Royals','Rajasthan').replace('Chennai Super Kings','Chennai').replace('Royal Challengers Bangalore','Bangalore').replace('Sunrisers Hyderabad','Hyderabad').replace('Kolkata Knight Riders','Kolkata')
				  }
				mrkp+='<div class="odds-item"><span class="item-title">'+name+'</span><span class="item-number">'+markets[i].odds+'</span></div>'
			}
			mrkp+=`</div><div class="powerby-logo"><span>Powered by</span><img src="/${this.widgetData.partnerLogo}?v=${this.configData.content.playerImg}" alt=""></div></a>`
		}else{
      if(isFirst){
        if(this.widgetData.bettingSitesComponent && this.widgetData.bettingSitesComponent.ad_code){
          mrkp = this.widgetData.bettingSitesComponent.ad_code;
        }
      }else{
        if(this.widgetData.adComponent && this.widgetData.adComponent.ad_code){
          mrkp = this.widgetData.adComponent.ad_code;
        }
      }
			// mrkp='<section id="" data-component="si-ads" data-template="widget_layout_01"></section>'
		}
		return mrkp
	},
	
	getInningName: function(index){
		var data = this.widgetData.gameData
		var battingTeam=data.Innings[index].Battingteam
		var _name = data.Teams[battingTeam].Name_Short;
		if(_name){
			_name=_name.toLowerCase();
			_name= _name.replace('dc','Delhi').replace('kxip','Punjab').replace('mi','Mumbai').replace('rr','Rajasthan').replace('csk','Chennai').replace('rcb','Bangalore').replace('srh','Hyderabad').replace('kkr','Kolkata')
		}			
		var wickets=data.Innings[index].Wickets
		if(wickets==10)wickets=""
		var score=data.Innings[index].Total?data.Innings[index].Total:''
		if(wickets){
			score=score+"/"+wickets;
		}
		
		var _over=data.Innings[index].Overs?data.Innings[index].Overs+' ov':''
		
		var preStr=""
		var format = data.Matchdetail.Match.Type?data.Matchdetail.Match.Type.toLowerCase():"";
		if (format && (format == "test" || format == "first-class" || format == 'youth-test' || format == 'exhibition-test')) {
			if (index < 2) preStr = " 1st"
			else preStr = " 2nd"
			
			preStr= preStr + " inn";
		}
			
		_name ='<span class="team-name">'+_name+'<em class="si-bottom">'+preStr+'</em></span><div class="inning-score"><span class="score">'+score+'</span><span class="overs">('+_over+')</span>'	
							
		return _name;
	},
	getWicketDetail: function(playerId,playerName) {
	  var mkp='<span class="text">'+playerName+'</span>';
		var innings=this.widgetData.gameData.Innings
		if(playerName=="needhowout"){				
			for(var i=0;i<innings.length;i++){
				for(var k=0;k<innings[i].Batsmen.length;k++){
					if(innings[i].Batsmen[k].Batsman==playerId){
						mkp=innings[i].Batsmen[k].Howout
						break
					}
				}
			}
		}else{				
			if(this.widgetData && this.widgetData.gameData && this.widgetData.gameData.Innings){				
				for(var i=0;i<innings.length;i++){
					for(var k=0;k<innings[i].Batsmen.length;k++){
						if(innings[i].Batsmen[k].Batsman==playerId){
							mkp='<span class="text">'+playerName+' ('+innings[i].Batsmen[k].Runs+') </span><span class="text">'+innings[i].Batsmen[k].Howout+'</span>';							
							break
						}
					}
				}
			}
		}	
		
		return mkp;
	}
  }
};
</script>
