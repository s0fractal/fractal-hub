# Snapshot file
# Unset all aliases to avoid conflicts with functions
unalias -a 2>/dev/null || true
# Functions
add-zsh-hook () {
	emulate -L zsh
	local -a hooktypes
	hooktypes=(chpwd precmd preexec periodic zshaddhistory zshexit zsh_directory_name) 
	local usage="Usage: add-zsh-hook hook function\nValid hooks are:\n  $hooktypes" 
	local opt
	local -a autoopts
	integer del list help
	while getopts "dDhLUzk" opt
	do
		case $opt in
			(d) del=1  ;;
			(D) del=2  ;;
			(h) help=1  ;;
			(L) list=1  ;;
			([Uzk]) autoopts+=(-$opt)  ;;
			(*) return 1 ;;
		esac
	done
	shift $(( OPTIND - 1 ))
	if (( list ))
	then
		typeset -mp "(${1:-${(@j:|:)hooktypes}})_functions"
		return $?
	elif (( help || $# != 2 || ${hooktypes[(I)$1]} == 0 ))
	then
		print -u$(( 2 - help )) $usage
		return $(( 1 - help ))
	fi
	local hook="${1}_functions" 
	local fn="$2" 
	if (( del ))
	then
		if (( ${(P)+hook} ))
		then
			if (( del == 2 ))
			then
				set -A $hook ${(P)hook:#${~fn}}
			else
				set -A $hook ${(P)hook:#$fn}
			fi
			if (( ! ${(P)#hook} ))
			then
				unset $hook
			fi
		fi
	else
		if (( ${(P)+hook} ))
		then
			if (( ${${(P)hook}[(I)$fn]} == 0 ))
			then
				typeset -ga $hook
				set -A $hook ${(P)hook} $fn
			fi
		else
			typeset -ga $hook
			set -A $hook $fn
		fi
		autoload $autoopts -- $fn
	fi
}
compaudit () {
	# undefined
	builtin autoload -XUz /usr/share/zsh/5.9/functions
}
compdef () {
	local opt autol type func delete eval new i ret=0 cmd svc 
	local -a match mbegin mend
	emulate -L zsh
	setopt extendedglob
	if (( ! $# ))
	then
		print -u2 "$0: I need arguments"
		return 1
	fi
	while getopts "anpPkKde" opt
	do
		case "$opt" in
			(a) autol=yes  ;;
			(n) new=yes  ;;
			([pPkK]) if [[ -n "$type" ]]
				then
					print -u2 "$0: type already set to $type"
					return 1
				fi
				if [[ "$opt" = p ]]
				then
					type=pattern 
				elif [[ "$opt" = P ]]
				then
					type=postpattern 
				elif [[ "$opt" = K ]]
				then
					type=widgetkey 
				else
					type=key 
				fi ;;
			(d) delete=yes  ;;
			(e) eval=yes  ;;
		esac
	done
	shift OPTIND-1
	if (( ! $# ))
	then
		print -u2 "$0: I need arguments"
		return 1
	fi
	if [[ -z "$delete" ]]
	then
		if [[ -z "$eval" ]] && [[ "$1" = *\=* ]]
		then
			while (( $# ))
			do
				if [[ "$1" = *\=* ]]
				then
					cmd="${1%%\=*}" 
					svc="${1#*\=}" 
					func="$_comps[${_services[(r)$svc]:-$svc}]" 
					[[ -n ${_services[$svc]} ]] && svc=${_services[$svc]} 
					[[ -z "$func" ]] && func="${${_patcomps[(K)$svc][1]}:-${_postpatcomps[(K)$svc][1]}}" 
					if [[ -n "$func" ]]
					then
						_comps[$cmd]="$func" 
						_services[$cmd]="$svc" 
					else
						print -u2 "$0: unknown command or service: $svc"
						ret=1 
					fi
				else
					print -u2 "$0: invalid argument: $1"
					ret=1 
				fi
				shift
			done
			return ret
		fi
		func="$1" 
		[[ -n "$autol" ]] && autoload -rUz "$func"
		shift
		case "$type" in
			(widgetkey) while [[ -n $1 ]]
				do
					if [[ $# -lt 3 ]]
					then
						print -u2 "$0: compdef -K requires <widget> <comp-widget> <key>"
						return 1
					fi
					[[ $1 = _* ]] || 1="_$1" 
					[[ $2 = .* ]] || 2=".$2" 
					[[ $2 = .menu-select ]] && zmodload -i zsh/complist
					zle -C "$1" "$2" "$func"
					if [[ -n $new ]]
					then
						bindkey "$3" | IFS=$' \t' read -A opt
						[[ $opt[-1] = undefined-key ]] && bindkey "$3" "$1"
					else
						bindkey "$3" "$1"
					fi
					shift 3
				done ;;
			(key) if [[ $# -lt 2 ]]
				then
					print -u2 "$0: missing keys"
					return 1
				fi
				if [[ $1 = .* ]]
				then
					[[ $1 = .menu-select ]] && zmodload -i zsh/complist
					zle -C "$func" "$1" "$func"
				else
					[[ $1 = menu-select ]] && zmodload -i zsh/complist
					zle -C "$func" ".$1" "$func"
				fi
				shift
				for i
				do
					if [[ -n $new ]]
					then
						bindkey "$i" | IFS=$' \t' read -A opt
						[[ $opt[-1] = undefined-key ]] || continue
					fi
					bindkey "$i" "$func"
				done ;;
			(*) while (( $# ))
				do
					if [[ "$1" = -N ]]
					then
						type=normal 
					elif [[ "$1" = -p ]]
					then
						type=pattern 
					elif [[ "$1" = -P ]]
					then
						type=postpattern 
					else
						case "$type" in
							(pattern) if [[ $1 = (#b)(*)=(*) ]]
								then
									_patcomps[$match[1]]="=$match[2]=$func" 
								else
									_patcomps[$1]="$func" 
								fi ;;
							(postpattern) if [[ $1 = (#b)(*)=(*) ]]
								then
									_postpatcomps[$match[1]]="=$match[2]=$func" 
								else
									_postpatcomps[$1]="$func" 
								fi ;;
							(*) if [[ "$1" = *\=* ]]
								then
									cmd="${1%%\=*}" 
									svc=yes 
								else
									cmd="$1" 
									svc= 
								fi
								if [[ -z "$new" || -z "${_comps[$1]}" ]]
								then
									_comps[$cmd]="$func" 
									[[ -n "$svc" ]] && _services[$cmd]="${1#*\=}" 
								fi ;;
						esac
					fi
					shift
				done ;;
		esac
	else
		case "$type" in
			(pattern) unset "_patcomps[$^@]" ;;
			(postpattern) unset "_postpatcomps[$^@]" ;;
			(key) print -u2 "$0: cannot restore key bindings"
				return 1 ;;
			(*) unset "_comps[$^@]" ;;
		esac
	fi
}
compdump () {
	# undefined
	builtin autoload -XUz /usr/share/zsh/5.9/functions
}
compinit () {
	# undefined
	builtin autoload -XUz /usr/share/zsh/5.9/functions
}
compinstall () {
	# undefined
	builtin autoload -XUz /usr/share/zsh/5.9/functions
}
fig_osc () {
	printf "\033]697;$1\007" "${@:2}"
}
fig_precmd () {
	local LAST_STATUS=$? 
	fig_reset_hooks
	fig_osc "OSCUnlock=%s" "${QTERM_SESSION_ID}"
	fig_osc "Dir=%s" "$PWD"
	fig_osc "Shell=zsh"
	fig_osc "ShellPath=%s" "${Q_SHELL:-$SHELL}"
	if [[ -n "${WSL_DISTRO_NAME:-}" ]]
	then
		fig_osc "WSLDistro=%s" "${WSL_DISTRO_NAME}"
	fi
	fig_osc "PID=%d" "$$"
	fig_osc "ExitCode=%s" "${LAST_STATUS}"
	fig_osc "TTY=%s" "${TTY}"
	fig_osc "Log=%s" "${Q_LOG_LEVEL}"
	fig_osc "ZshAutosuggestionColor=%s" "${ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE}"
	fig_osc "FigAutosuggestionColor=%s" "${Q_AUTOSUGGEST_HIGHLIGHT_STYLE}"
	fig_osc "User=%s" "${USER:-root}"
	if [ "$Q_HAS_SET_PROMPT" -eq 1 ]
	then
		fig_preexec
	fi
	START_PROMPT=$'\033]697;StartPrompt\007' 
	END_PROMPT=$'\033]697;EndPrompt\007' 
	NEW_CMD=$'\033]697;NewCmd='"${QTERM_SESSION_ID}"$'\007' 
	Q_USER_PS1="$PS1" 
	Q_USER_PROMPT="$PROMPT" 
	Q_USER_prompt="$prompt" 
	Q_USER_PS2="$PS2" 
	Q_USER_PROMPT2="$PROMPT2" 
	Q_USER_PS3="$PS3" 
	Q_USER_PROMPT3="$PROMPT3" 
	Q_USER_PS4="$PS4" 
	Q_USER_PROMPT4="$PROMPT4" 
	Q_USER_RPS1="$RPS1" 
	Q_USER_RPROMPT="$RPROMPT" 
	Q_USER_RPS2="$RPS2" 
	Q_USER_RPROMPT2="$RPROMPT2" 
	if [ -n "${PROMPT+x}" ]
	then
		PROMPT="%{$START_PROMPT%}$PROMPT%{$END_PROMPT$NEW_CMD%}" 
	elif [ -n "${prompt+x}" ]
	then
		prompt="%{$START_PROMPT%}$prompt%{$END_PROMPT$NEW_CMD%}" 
	else
		PS1="%{$START_PROMPT%}$PS1%{$END_PROMPT$NEW_CMD%}" 
	fi
	if [ -n "${PROMPT2+x}" ]
	then
		PROMPT2="%{$START_PROMPT%}$PROMPT2%{$END_PROMPT%}" 
	else
		PS2="%{$START_PROMPT%}$PS2%{$END_PROMPT%}" 
	fi
	if [ -n "${PROMPT3+x}" ]
	then
		PROMPT3="%{$START_PROMPT%}$PROMPT3%{$END_PROMPT$NEW_CMD%}" 
	else
		PS3="%{$START_PROMPT%}$PS3%{$END_PROMPT$NEW_CMD%}" 
	fi
	if [ -n "${PROMPT4+x}" ]
	then
		PROMPT4="%{$START_PROMPT%}$PROMPT4%{$END_PROMPT%}" 
	else
		PS4="%{$START_PROMPT%}$PS4%{$END_PROMPT%}" 
	fi
	if [ -n "${RPROMPT+x}" ]
	then
		RPROMPT="%{$START_PROMPT%}$RPROMPT%{$END_PROMPT%}" 
	else
		RPS1="%{$START_PROMPT%}$RPS1%{$END_PROMPT%}" 
	fi
	if [ -n "${RPROMPT2+x}" ]
	then
		RPROMPT2="%{$START_PROMPT%}$RPROMPT2%{$END_PROMPT%}" 
	else
		RPS2="%{$START_PROMPT%}$RPS2%{$END_PROMPT%}" 
	fi
	Q_HAS_SET_PROMPT=1 
	if command -v q > /dev/null 2>&1
	then
		(
			command q _ pre-cmd --alias "$(\alias)" > /dev/null 2>&1 &
		) > /dev/null 2>&1
	fi
}
fig_preexec () {
	if [ -n "${PS1+x}" ]
	then
		PS1="$Q_USER_PS1" 
	fi
	if [ -n "${PROMPT+x}" ]
	then
		PROMPT="$Q_USER_PROMPT" 
	fi
	if [ -n "${prompt+x}" ]
	then
		prompt="$Q_USER_prompt" 
	fi
	if [ -n "${PS2+x}" ]
	then
		PS2="$Q_USER_PS2" 
	fi
	if [ -n "${PROMPT2+x}" ]
	then
		PROMPT2="$Q_USER_PROMPT2" 
	fi
	if [ -n "${PS3+x}" ]
	then
		PS3="$Q_USER_PS3" 
	fi
	if [ -n "${PROMPT3+x}" ]
	then
		PROMPT3="$Q_USER_PROMPT3" 
	fi
	if [ -n "${PS4+x}" ]
	then
		PS4="$Q_USER_PS4" 
	fi
	if [ -n "${PROMPT4+x}" ]
	then
		PROMPT4="$Q_USER_PROMPT4" 
	fi
	if [ -n "${RPS1+x}" ]
	then
		RPS1="$Q_USER_RPS1" 
	fi
	if [ -n "${RPROMPT+x}" ]
	then
		RPROMPT="$Q_USER_RPROMPT" 
	fi
	if [ -n "${RPS2+x}" ]
	then
		RPS2="$Q_USER_RPS2" 
	fi
	if [ -n "${RPROMPT2+x}" ]
	then
		RPROMPT2="$Q_USER_RPROMPT2" 
	fi
	Q_HAS_SET_PROMPT=0 
	fig_osc "OSCLock=%s" "${QTERM_SESSION_ID}"
	fig_osc PreExec
}
fig_reset_hooks () {
	if [[ "$precmd_functions[-1]" != fig_precmd ]]
	then
		precmd_functions=(${(@)precmd_functions:#fig_precmd} fig_precmd) 
	fi
	if [[ "$preexec_functions[1]" != fig_preexec ]]
	then
		preexec_functions=(fig_preexec ${(@)preexec_functions:#fig_preexec}) 
	fi
}
getent () {
	if [[ $1 = hosts ]]
	then
		sed 's/#.*//' /etc/$1 | grep -w $2
	elif [[ $2 = <-> ]]
	then
		grep ":$2:[^:]*$" /etc/$1
	else
		grep "^$2:" /etc/$1
	fi
}
is-at-least () {
	emulate -L zsh
	local IFS=".-" min_cnt=0 ver_cnt=0 part min_ver version order 
	min_ver=(${=1}) 
	version=(${=2:-$ZSH_VERSION} 0) 
	while (( $min_cnt <= ${#min_ver} ))
	do
		while [[ "$part" != <-> ]]
		do
			(( ++ver_cnt > ${#version} )) && return 0
			if [[ ${version[ver_cnt]} = *[0-9][^0-9]* ]]
			then
				order=(${version[ver_cnt]} ${min_ver[ver_cnt]}) 
				if [[ ${version[ver_cnt]} = <->* ]]
				then
					[[ $order != ${${(On)order}} ]] && return 1
				else
					[[ $order != ${${(O)order}} ]] && return 1
				fi
				[[ $order[1] != $order[2] ]] && return 0
			fi
			part=${version[ver_cnt]##*[^0-9]} 
		done
		while true
		do
			(( ++min_cnt > ${#min_ver} )) && return 0
			[[ ${min_ver[min_cnt]} = <-> ]] && break
		done
		(( part > min_ver[min_cnt] )) && return 0
		(( part < min_ver[min_cnt] )) && return 1
		part='' 
	done
}
# Shell Options
setopt nohashdirs
setopt login
# Aliases
alias -- evolve='skull evolve'
alias -- run-help=man
alias -- sc='~/.ai-ecosystem/bin/sc'
alias -- think='skull think'
alias -- which-command=whence
# Check for rg availability
if ! command -v rg >/dev/null 2>&1; then
  alias rg='/Users/chaoshex/Library/Caches/deno/npm/registry.npmjs.org/\@anthropic-ai/claude-code/1.0.62/vendor/ripgrep/arm64-darwin/rg'
fi
export PATH='/Users/chaoshex/.local/bin:~/bin:/Users/chaoshex/.cargo/bin:/Users/chaoshex/.skull:/Users/chaoshex/.deno/bin:/Users/chaoshex/Library/pnpm:/Library/Frameworks/Python.framework/Versions/3.13/bin:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/System/Cryptexes/App/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin:/Users/chaoshex/.cargo/bin:/Users/chaoshex/.local/bin:/Users/chaoshex/Library/Python/3.13/bin:/Users/chaoshex/Library/Python/3.13/bin'
