import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Settings } from 'src/app/app.models';
import { Theme } from 'src/app/game/src/Utils/Enums';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  animation = false
  sound = false
  userSettings: Settings | undefined

  themes = Object.values(Theme);
  selectedTheme = Theme.CLASSIC

  constructor (private userService: UserService) { }

  ngOnInit() {
    this.userService.getSettings().toPromise().then((settings: Settings)=> {
      this.userSettings = settings
      this.animation = !settings.skip_animations
      this.sound = settings.sound_on
      this.selectedTheme = settings.theme
    })
  }

  changeAnimationShowOption(){
    if (this.userSettings){
      !this.animation
      this.userSettings.skip_animations = !this.animation
      this.userService.updateSettings(this.userSettings)
    }
  }

  changeSoundOption(){
    if (this.userSettings){
      !this.sound
      this.userSettings.sound_on = this.sound
      this.userService.updateSettings(this.userSettings)
    }
  }

  changeThemeOption(){
    if (this.userSettings){
      this.userSettings.theme = this.selectedTheme;
      this.userService.updateSettings(this.userSettings)
    }
  }
}
